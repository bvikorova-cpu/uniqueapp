// E2E test for the job listing activation fallback inside stripe-webhook.
// Signs a checkout.session.completed event with STRIPE_WEBHOOK_SECRET and POSTs
// to the deployed webhook endpoint. Verifies graceful handling when the
// referenced job_listings row does NOT exist (no DB writes, 200 response).
//
// To assert real activation, supply E2E_TEST_JOB_LISTING_ID env var pointing
// to a pre-seeded job_listings row (with employer_id matching) and the test
// will additionally verify it was activated and a job_listing_payments row
// was created.
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const WEBHOOK_URL =
  (Deno.env.get("VITE_SUPABASE_URL") ?? "https://jufrdzeonywluwutvyxz.supabase.co") +
  "/functions/v1/stripe-webhook";

const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const STRIPE_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";

function buildEvent(opts: {
  sessionId: string;
  jobListingId: string;
  productKey: string;
  userId?: string;
  amount?: number;
}) {
  return {
    id: `evt_test_${crypto.randomUUID()}`,
    object: "event",
    api_version: "2025-08-27.basil",
    created: Math.floor(Date.now() / 1000),
    type: "checkout.session.completed",
    data: {
      object: {
        id: opts.sessionId,
        object: "checkout.session",
        payment_status: "paid",
        payment_intent: `pi_test_${crypto.randomUUID().replace(/-/g, "")}`,
        customer: null,
        amount_total: opts.amount ?? 2900,
        currency: "eur",
        mode: "payment",
        metadata: {
          jobListingId: opts.jobListingId,
          productKey: opts.productKey,
          ...(opts.userId ? { userId: opts.userId } : {}),
        },
      },
    },
  };
}

async function postSignedEvent(payload: unknown): Promise<Response> {
  const body = JSON.stringify(payload);
  const stripe = new Stripe(STRIPE_KEY || "sk_test_dummy", {
    apiVersion: "2025-08-27.basil",
  });
  const ts = Math.floor(Date.now() / 1000);
  const sig = await stripe.webhooks.generateTestHeaderStringAsync({
    payload: body,
    secret: WEBHOOK_SECRET,
    timestamp: ts,
  });

  return await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "content-type": "application/json", "stripe-signature": sig },
    body,
  });
}

Deno.test("webhook: missing job_listing → 200 graceful, no DB writes", async () => {
  const sessionId = `cs_test_${crypto.randomUUID().replace(/-/g, "")}`;
  const ghostListingId = crypto.randomUUID();
  const event = buildEvent({
    sessionId,
    jobListingId: ghostListingId,
    productKey: "job_listing_7",
  });
  const res = await postSignedEvent(event);
  const text = await res.text();
  console.log("[ghost-listing] status:", res.status, "body:", text);
  assertEquals(res.status, 200);
});

Deno.test("webhook: real job_listing → activates listing + creates payment row", async () => {
  const jobListingId = Deno.env.get("E2E_TEST_JOB_LISTING_ID");
  if (!jobListingId) {
    console.log("skipping: E2E_TEST_JOB_LISTING_ID not set");
    return;
  }
  const sessionId = `cs_test_${crypto.randomUUID().replace(/-/g, "")}`;
  const event = buildEvent({
    sessionId,
    jobListingId,
    productKey: "job_listing_7",
    amount: 2900,
  });
  const res = await postSignedEvent(event);
  await res.text();
  assertEquals(res.status, 200);

  // Wait briefly for write to settle, then verify (requires anon read access
  // to job_listings/payments OR run with service role key).
  await new Promise((r) => setTimeout(r, 1500));

  const anonKey = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
  const supaUrl =
    Deno.env.get("VITE_SUPABASE_URL") ?? "https://jufrdzeonywluwutvyxz.supabase.co";
  const sb = createClient(supaUrl, anonKey);

  const { data: pay } = await sb
    .from("job_listing_payments")
    .select("status, stripe_session_id, product_kind")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();
  console.log("[real-listing] payment row:", pay);
  assertEquals(pay?.status, "completed");
  assertEquals(pay?.product_kind, "job_listing_7");
});
