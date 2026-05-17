// Donor self-service refund within 14 days of a one-time donation.
// Auth: requires user JWT; donor must match donation.donor_id.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (s: string, d?: unknown) =>
  console.log(`[request-donation-refund] ${s}${d ? " " + JSON.stringify(d) : ""}`);

const REFUND_WINDOW_DAYS = 14;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Unauthorized" }, 401);
    const { data: userData, error: userErr } = await supabase.auth.getUser(
      auth.replace("Bearer ", ""),
    );
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const donationId = String(body.donationId || "").trim();
    const reason = String(body.reason || "").slice(0, 500);
    if (!donationId) return json({ error: "donationId required" }, 400);

    const { data: donation, error: dErr } = await supabase
      .from("campaign_donations")
      .select("id, donor_id, status, is_monthly, stripe_payment_id, amount, net_amount, created_at, campaign_type, campaign_id")
      .eq("id", donationId)
      .maybeSingle();
    if (dErr || !donation) return json({ error: "Donation not found" }, 404);
    if (donation.donor_id !== user.id) return json({ error: "Forbidden" }, 403);
    if (!["paid", "completed"].includes(donation.status ?? "")) {
      return json({ error: `Cannot refund donation in status: ${donation.status}` }, 400);
    }
    if (donation.is_monthly) {
      return json({ error: "Monthly donations: cancel the subscription instead." }, 400);
    }
    if (!donation.stripe_payment_id) {
      return json({ error: "Missing Stripe payment reference; contact support." }, 400);
    }
    const ageMs = Date.now() - new Date(donation.created_at!).getTime();
    if (ageMs > REFUND_WINDOW_DAYS * 24 * 3600 * 1000) {
      return json({ error: `Refund window of ${REFUND_WINDOW_DAYS} days has expired.` }, 400);
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    log("issuing refund", { pi: donation.stripe_payment_id, donationId });
    const refund = await stripe.refunds.create({
      payment_intent: donation.stripe_payment_id,
      reason: "requested_by_customer",
      metadata: {
        donation_id: donation.id,
        donor_id: user.id,
        donor_reason: reason || "",
      },
    });

    // Reconcile DB (idempotent). Webhook may also fire charge.refunded.
    const { data: rpcRes, error: rpcErr } = await supabase.rpc("refund_campaign_donation", {
      _stripe_payment_id: donation.stripe_payment_id,
      _stripe_refund_id: refund.id,
      _refund_amount: (refund.amount ?? 0) / 100,
    });
    if (rpcErr) log("RPC error (non-fatal)", rpcErr);

    // Audit log (best-effort)
    await supabase.from("admin_audit_log").insert({
      admin_id: user.id,
      action: "donor_self_refund",
      target_type: "campaign_donation",
      target_id: donation.id,
      details: {
        stripe_refund_id: refund.id,
        amount: refund.amount,
        reason,
        campaign_type: donation.campaign_type,
        campaign_id: donation.campaign_id,
      },
    }).then(() => {}, () => {});

    return json({ success: true, refund_id: refund.id, rpc: rpcRes });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log("ERROR", msg);
    return json({ error: msg }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
