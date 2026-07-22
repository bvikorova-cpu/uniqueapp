// Reads the user's actual verification status from Stripe (source of truth):
//   • Verified  → one-off payment (checkout.session mode=payment, module=verification)
//   • Plus/Pro  → active recurring subscription with metadata.module=verification
// Reconciles profiles.verification_tier / verification_expires_at when it drifts,
// so ProfileVerificationCard always matches the real payment state.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const log = (step: string, details?: unknown) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CHECK-VERIFICATION] ${step}${d}`);
};

type Tier = "verified" | "plus" | "pro";
const TIER_BY_PRICE: Record<string, Tier> = { "price_1TvEcCGaXSfGtYFtpISbqkdD": "verified",
  "price_1TvEcEGaXSfGtYFtEHzujgoE": "plus",
  "price_1TvEcFGaXSfGtYFtc8kKfh5M": "pro",
  // Legacy price IDs — still honored for existing customers.
  "price_1TvDqrGaXSfGtYFt2g1n3Nuv": "verified",
  "price_1TvDqsGaXSfGtYFtSyfF7vjE": "plus",
  "price_1TvDqsGaXSfGtYFt6boV1wed": "pro" };

const TIER_RANK: Record<Tier | "none", number> = { none: 0, verified: 1, plus: 2, pro: 3 };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authorization header required");

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

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // Find customer(s) for this email
    const customers = await stripe.customers.list({ email, limit: 5 });
    let bestTier: Tier | "none" = "none";
    let expiresAt: string | null = null;
    let status: "none" | "active" | "canceling" | "expired" = "none";
    let subscriptionId: string | null = null;
    let lastSessionId: string | null = null;

    const consider = (tier: Tier, exp: string | null, st: typeof status, subId?: string | null, sess?: string | null) => {
      if (TIER_RANK[tier] > TIER_RANK[bestTier]) {
        bestTier = tier;
        expiresAt = exp;
        status = st;
        subscriptionId = subId ?? null;
        lastSessionId = sess ?? null;
      }
    };

    for (const c of customers.data) { // Recurring: Plus / Pro
      const subs = await stripe.subscriptions.list({
        customer: c.id,
        status: "all",
        limit: 20,
        expand: ["data.items.data.price"] });
      for (const sub of subs.data) {
        if (!["active", "trialing", "past_due"].includes(sub.status)) continue;
        const priceId = sub.items.data[0]?.price?.id;
        const tier = priceId ? TIER_BY_PRICE[priceId] : undefined;
        const meta = sub.metadata?.module ?? sub.items.data[0]?.price?.metadata?.module;
        if (!tier || tier === "verified") continue;
        if (meta && meta !== "verification") continue;
        const exp = sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null;
        const st = sub.cancel_at_period_end ? "canceling" : "active";
        consider(tier, exp, st, sub.id);
      }

      // One-off: Verified badge (mode=payment). Look at recent paid sessions.
      const sessions = await stripe.checkout.sessions.list({ customer: c.id,
        limit: 20 });
      for (const s of sessions.data) {
        if (s.mode !== "payment") continue;
        if (s.payment_status !== "paid") continue;
        if (s.metadata?.module !== "verification") continue;
        const priceId = s.metadata?.price_id;
        const tier = (priceId && TIER_BY_PRICE[priceId]) || (s.metadata?.tier as Tier | undefined);
        if (tier !== "verified") continue;
        // "Verified" is effectively lifetime; keep a far-future expiry marker.
        const exp = new Date();
        exp.setFullYear(exp.getFullYear() + 100);
        consider("verified", exp.toISOString(), "active", null, s.id);
      }
    }

    // Reconcile DB if it disagrees with Stripe
    const { data: profile } = await admin
      .from("profiles")
      .select("verification_tier, verification_expires_at")
      .eq("id", userId)
      .maybeSingle();

    const dbTier = (profile?.verification_tier as Tier | "none" | null) ?? "none";
    const dbExp = profile?.verification_expires_at ?? null;
    const needsUpdate =
      dbTier !== bestTier ||
      (expiresAt && dbExp !== expiresAt) ||
      (bestTier === "none" && dbTier !== "none");

    if (needsUpdate) {
      const { error: upErr } = await admin
        .from("profiles")
        .update({ verification_tier: bestTier === "none" ? "none" : bestTier,
          verification_expires_at: bestTier === "none" ? null : expiresAt })
        .eq("id", userId);
      if (upErr) log("profile reconcile failed", { err: upErr.message });
      else log("profile reconciled", { userId, from: dbTier, to: bestTier });
    }

    return new Response(
      JSON.stringify({ tier: bestTier,
        status,
        expires_at: expiresAt,
        subscription_id: subscriptionId,
        last_session_id: lastSessionId,
        reconciled: needsUpdate,
        source: "stripe" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
