// Manage an existing Unique Verified subscription:
//   • action: "downgrade"  → switch Pro↔Plus with pro-rata credit (immediate)
//   • action: "cancel"     → cancel_at_period_end (keeps access until expiry)
//   • action: "resume"     → un-cancel if scheduled to cancel
//   • action: "cancel_now" → immediate cancellation + prorated refund credit
// Verified (one-off) tier cannot be "downgraded"/refunded here — it's a one-time badge.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const log = (step: string, details?: unknown) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[MANAGE-VERIFICATION] ${step}${d}`);
};

type Tier = "verified" | "plus" | "pro";
const PRICE_BY_TIER: Record<"plus" | "pro", string> = { plus: "price_1TvEcEGaXSfGtYFtEHzujgoE",
  pro: "price_1TvEcFGaXSfGtYFtc8kKfh5M" };
const TIER_BY_PRICE: Record<string, Tier> = { "price_1TvEcCGaXSfGtYFtpISbqkdD": "verified",
  "price_1TvEcEGaXSfGtYFtEHzujgoE": "plus",
  "price_1TvEcFGaXSfGtYFtc8kKfh5M": "pro",
  // Legacy price IDs
  "price_1TvDqrGaXSfGtYFt2g1n3Nuv": "verified",
  "price_1TvDqsGaXSfGtYFtSyfF7vjE": "plus",
  "price_1TvDqsGaXSfGtYFt6boV1wed": "pro" };


type Action = "downgrade" | "cancel" | "resume" | "cancel_now";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authorization header required");

    const body = await req.json().catch(() => ({}));
    const action = body?.action as Action | undefined;
    const targetTier = body?.target_tier as "plus" | "pro" | undefined;
    if (!action) throw new Error("action is required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user?.email) throw new Error("Authentication failed");
    const userId = userData.user.id;
    const email = userData.user.email;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });

    // Find the active recurring subscription for this user.
    const customers = await stripe.customers.list({ email, limit: 5 });
    let sub: Stripe.Subscription | null = null;
    let customerId: string | null = null;
    for (const c of customers.data) { const subs = await stripe.subscriptions.list({
        customer: c.id,
        status: "all",
        limit: 20,
        expand: ["data.items.data.price"] });
      for (const s of subs.data) {
        if (!["active", "trialing", "past_due"].includes(s.status)) continue;
        const priceId = s.items.data[0]?.price?.id;
        const tier = priceId ? TIER_BY_PRICE[priceId] : undefined;
        if (tier !== "plus" && tier !== "pro") continue;
        const meta = s.metadata?.module ?? s.items.data[0]?.price?.metadata?.module;
        if (meta && meta !== "verification") continue;
        sub = s;
        customerId = c.id;
        break;
      }
      if (sub) break;
    }

    if (!sub) throw new Error("No active Unique Verified subscription found.");

    let result: Record<string, unknown> = { action, subscription_id: sub.id };

    if (action === "downgrade") {
      if (!targetTier) throw new Error("target_tier required for downgrade");
      const newPriceId = PRICE_BY_TIER[targetTier];
      if (!newPriceId) throw new Error("Unknown target_tier");
      const currentItem = sub.items.data[0];
      const currentPriceId = currentItem?.price?.id;
      if (currentPriceId === newPriceId) throw new Error("Already on this tier.");

      const updated = await stripe.subscriptions.update(sub.id, {
        items: [{ id: currentItem.id, price: newPriceId }],
        proration_behavior: "create_prorations",
        cancel_at_period_end: false,
        metadata: { ...(sub.metadata ?? {}), module: "verification", tier: targetTier } });
      log("downgrade complete", { subId: sub.id, to: targetTier });
      result = { ...result,
        new_tier: targetTier,
        current_period_end: updated.current_period_end };
    } else if (action === "cancel") { const updated = await stripe.subscriptions.update(sub.id, {
        cancel_at_period_end: true });
      result = { ...result, cancels_at: updated.current_period_end };
    } else if (action === "resume") { const updated = await stripe.subscriptions.update(sub.id, {
        cancel_at_period_end: false });
      result = { ...result, renews_at: updated.current_period_end };
    } else if (action === "cancel_now") { // Immediate cancel with prorated credit back to customer's balance.
      const cancelled = await stripe.subscriptions.cancel(sub.id, {
        prorate: true,
        invoice_now: false });
      result = { ...result, status: cancelled.status };
    } else {
      throw new Error("Unknown action");
    }

    // Reconcile profile immediately so UI reflects the change without waiting for the webhook.
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    if (action === "downgrade" && targetTier) {
      await admin
        .from("profiles")
        .update({ verification_tier: targetTier })
        .eq("id", userId);
    } else if (action === "cancel_now") {
      await admin
        .from("profiles")
        .update({ verification_tier: "none", verification_expires_at: null })
        .eq("id", userId);
    }

    return new Response(JSON.stringify({ ok: true, ...result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
