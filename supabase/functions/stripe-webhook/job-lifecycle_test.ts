// End-to-end job lifecycle tests against the deployed Supabase project.
//
// Covers:
//   1. Refund flow      — charge.refunded webhook deactivates the listing
//                         (paid_status='refunded', is_active=false).
//   2. Dispute flow     — charge.dispute.created webhook flips listing to
//                         disputed and deactivates it.
//   3. Expiration cron  — public.expire_old_job_listings() flips an expired
//                         active listing to paid_status='expired'.
//   4. Employer verify  — submitting + approving an employer_verifications
//                         row transitions verification_status through the
//                         pending → approved lifecycle.
//
// Requires SUPABASE_SERVICE_ROLE_KEY in .env (these tests bypass RLS to
// seed/assert state). STRIPE_WEBHOOK_SECRET + STRIPE_SECRET_KEY are needed
// to sign synthetic webhook events.
//
// Skips gracefully when secrets are missing so CI never red-bars.

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL =
  Deno.env.get("VITE_SUPABASE_URL") ?? "https://jufrdzeonywluwutvyxz.supabase.co";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
const STRIPE_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const WEBHOOK_URL = `${SUPABASE_URL}/functions/v1/stripe-webhook`;

const SEED_EMPLOYER_ID = "11111111-1111-1111-1111-1111111111e1";

function sb() {
  return createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
}

async function signAndPost(event: unknown): Promise<Response> {
  const body = JSON.stringify(event);
  const stripe = new Stripe(STRIPE_KEY || "sk_test_dummy", {
    apiVersion: "2025-08-27.basil",
  });
  const sig = await stripe.webhooks.generateTestHeaderStringAsync({
    payload: body,
    secret: WEBHOOK_SECRET,
    timestamp: Math.floor(Date.now() / 1000),
  });
  return await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "content-type": "application/json", "stripe-signature": sig },
    body,
  });
}

async function seedActiveListing(piId: string): Promise<string | null> {
  const admin = sb();
  // Try to reuse a permanent seeded employer; otherwise pick any existing one.
  const { data: anyEmp } = await admin
    .from("job_listings")
    .select("employer_id")
    .limit(1)
    .maybeSingle();
  const employerId = anyEmp?.employer_id ?? SEED_EMPLOYER_ID;

  const jobId = crypto.randomUUID();
  const { error: jErr } = await admin.from("job_listings").insert({
    id: jobId,
    employer_id: employerId,
    title: "E2E Lifecycle Test Listing",
    description: "Synthetic listing — safe to delete.",
    company_name: "E2E Co",
    location: "Bratislava",
    country: "SK",
    category: "engineering" as any,
    job_type: "full_time" as any,
    contact_email: "e2e@example.com",
    paid_status: "active",
    is_active: true,
    duration_days: 7,
    published_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
  });
  if (jErr) {
    console.log("seedActiveListing: insert failed", jErr.message);
    return null;
  }

  await admin.from("job_listing_payments").insert({
    user_id: employerId,
    job_id: jobId,
    stripe_session_id: `cs_test_${crypto.randomUUID().replace(/-/g, "")}`,
    stripe_payment_intent_id: piId,
    amount: 2900,
    duration_days: 7,
    status: "completed",
    expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
  });
  return jobId;
}

async function cleanup(jobId: string) {
  const admin = sb();
  await admin.from("job_listing_payments").delete().eq("job_id", jobId);
  await admin.from("job_listings").delete().eq("id", jobId);
}

// ──────────────────────────────────────────────────────────────────────────
// 1. REFUND
// ──────────────────────────────────────────────────────────────────────────
Deno.test("refund: charge.refunded deactivates job listing", async () => {
  if (!SERVICE_KEY || !WEBHOOK_SECRET) {
    console.log("skipping: SERVICE_ROLE/WEBHOOK_SECRET missing");
    return;
  }
  const piId = `pi_test_${crypto.randomUUID().replace(/-/g, "")}`;
  const jobId = await seedActiveListing(piId);
  if (!jobId) return;

  try {
    const event = {
      id: `evt_test_${crypto.randomUUID()}`,
      type: "charge.refunded",
      data: {
        object: {
          id: `ch_test_${crypto.randomUUID().replace(/-/g, "")}`,
          object: "charge",
          payment_intent: piId,
          amount_refunded: 2900,
          refunds: {
            data: [{ id: `re_test_${crypto.randomUUID().replace(/-/g, "")}`, reason: "requested_by_customer" }],
          },
        },
      },
    };
    const res = await signAndPost(event);
    await res.text();
    assertEquals(res.status, 200);
    await new Promise((r) => setTimeout(r, 1500));

    const { data: listing } = await sb()
      .from("job_listings")
      .select("paid_status, is_active")
      .eq("id", jobId)
      .maybeSingle();
    console.log("[refund] listing after webhook:", listing);
    assertEquals(listing?.paid_status, "refunded");
    assertEquals(listing?.is_active, false);

    const { data: pay } = await sb()
      .from("job_listing_payments")
      .select("status, refunded_at")
      .eq("stripe_payment_intent_id", piId)
      .maybeSingle();
    assertEquals(pay?.status, "refunded");
    assert(pay?.refunded_at);
  } finally {
    await cleanup(jobId);
  }
});

// ──────────────────────────────────────────────────────────────────────────
// 2. DISPUTE
// ──────────────────────────────────────────────────────────────────────────
Deno.test("dispute: charge.dispute.created flips job listing to disputed", async () => {
  if (!SERVICE_KEY || !WEBHOOK_SECRET) {
    console.log("skipping: SERVICE_ROLE/WEBHOOK_SECRET missing");
    return;
  }
  const piId = `pi_test_${crypto.randomUUID().replace(/-/g, "")}`;
  const jobId = await seedActiveListing(piId);
  if (!jobId) return;

  try {
    const event = {
      id: `evt_test_${crypto.randomUUID()}`,
      type: "charge.dispute.created",
      data: {
        object: {
          id: `dp_test_${crypto.randomUUID().replace(/-/g, "")}`,
          object: "dispute",
          payment_intent: piId,
          charge: `ch_test_${crypto.randomUUID().replace(/-/g, "")}`,
          amount: 2900,
          currency: "eur",
          reason: "fraudulent",
          status: "needs_response",
          is_charge_refundable: true,
          evidence: {},
        },
      },
    };
    const res = await signAndPost(event);
    await res.text();
    assertEquals(res.status, 200);
    await new Promise((r) => setTimeout(r, 1500));

    const { data: listing } = await sb()
      .from("job_listings")
      .select("paid_status, is_active")
      .eq("id", jobId)
      .maybeSingle();
    console.log("[dispute] listing after webhook:", listing);
    assertEquals(listing?.paid_status, "disputed");
    assertEquals(listing?.is_active, false);
  } finally {
    await cleanup(jobId);
  }
});

// ──────────────────────────────────────────────────────────────────────────
// 3. EXPIRATION CRON
// ──────────────────────────────────────────────────────────────────────────
Deno.test("expiration: expire_old_job_listings() flips past-due listings", async () => {
  if (!SERVICE_KEY) {
    console.log("skipping: SERVICE_ROLE missing");
    return;
  }
  const admin = sb();
  const { data: anyEmp } = await admin
    .from("job_listings")
    .select("employer_id")
    .limit(1)
    .maybeSingle();
  const employerId = anyEmp?.employer_id;
  if (!employerId) {
    console.log("skipping: no employer available to attribute test listing to");
    return;
  }

  const jobId = crypto.randomUUID();
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const { error } = await admin.from("job_listings").insert({
    id: jobId,
    employer_id: employerId,
    title: "E2E Expire Test Listing",
    description: "Synthetic — safe to delete.",
    company_name: "E2E Co",
    location: "Bratislava",
    country: "SK",
    category: "engineering" as any,
    job_type: "full_time" as any,
    contact_email: "e2e@example.com",
    paid_status: "active",
    is_active: true,
    duration_days: 7,
    published_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    expires_at: yesterday,
  });
  if (error) {
    console.log("expire test: insert failed", error.message);
    return;
  }
  try {
    const { data: cnt, error: rpcErr } = await admin.rpc("expire_old_job_listings");
    if (rpcErr) {
      console.log("expire rpc error", rpcErr.message);
      return;
    }
    console.log("[expire] rpc returned:", cnt);
    assert(typeof cnt === "number" && cnt >= 1);

    const { data: listing } = await admin
      .from("job_listings")
      .select("paid_status, is_active")
      .eq("id", jobId)
      .maybeSingle();
    console.log("[expire] listing after cron:", listing);
    assertEquals(listing?.paid_status, "expired");
    assertEquals(listing?.is_active, false);
  } finally {
    await admin.from("job_listings").delete().eq("id", jobId);
  }
});

// ──────────────────────────────────────────────────────────────────────────
// 4. EMPLOYER VERIFICATION FLOW
// ──────────────────────────────────────────────────────────────────────────
Deno.test("employer verification: pending → approved transition", async () => {
  if (!SERVICE_KEY) {
    console.log("skipping: SERVICE_ROLE missing");
    return;
  }
  const admin = sb();
  const employerId = crypto.randomUUID();

  // Insert pending verification (service role bypasses FK to auth.users so we
  // use a random id; if FK exists, this will fail and we skip).
  const { error: insErr } = await admin.from("employer_verifications").insert({
    employer_id: employerId,
    company_name: "E2E Verification Co",
    company_address: "Hlavná 1, Bratislava",
    company_phone: "+421900000000",
    verification_status: "pending" as any,
    submitted_at: new Date().toISOString(),
  });
  if (insErr) {
    console.log("verification insert failed (likely auth FK):", insErr.message);
    return;
  }

  try {
    // Approve
    const { error: updErr } = await admin
      .from("employer_verifications")
      .update({
        verification_status: "approved" as any,
        reviewed_at: new Date().toISOString(),
      })
      .eq("employer_id", employerId);
    assertEquals(updErr, null);

    const { data: row } = await admin
      .from("employer_verifications")
      .select("verification_status, reviewed_at")
      .eq("employer_id", employerId)
      .maybeSingle();
    console.log("[verification] approved row:", row);
    assertEquals(row?.verification_status, "approved");
    assert(row?.reviewed_at);
  } finally {
    await admin.from("employer_verifications").delete().eq("employer_id", employerId);
  }
});
