import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };

// Unique platform subscription plans (EUR only).
const PRICES: Record<string, { monthly: string; yearly: string }> = {
  basic: {
    monthly: "price_1TyKPAGaXSfGtYFt6JLD4Gx0", // €5 / mo
    yearly: "price_1TyKPmGaXSfGtYFtdwnjjLet" }, // €48 / yr
  premium: {
    monthly: "price_1TyKPEGaXSfGtYFtsyKchTEY", // €15 / mo
    yearly: "price_1TyKQEGaXSfGtYFtQUuNCVNm" }, // €144 / yr
  business: {
    monthly: "price_1TyKPHGaXSfGtYFtYKUk6aYV", // €50 / mo
    yearly: "price_1TyKSCGaXSfGtYFtr3pqpX7G" } }; // €480 / yr

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { tier, billing } = await req.json().catch(() => ({}));
    const plan = typeof tier === "string" ? PRICES[tier] : undefined;
    if (!plan) {
      return new Response(
        JSON.stringify({ error: "Invalid tier. Must be 'basic', 'premium' or 'business'." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }
    const interval = billing === "yearly" ? "yearly" : "monthly";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: uErr } = await supabase.auth.getUser(token);
    if (uErr || !userData.user?.email) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401 });
    }
    const user = userData.user;

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const origin = req.headers.get("origin") ?? "https://uniqueapp.fun";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: plan[interval], quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
        metadata: { product: "unique_subscription", tier, billing: interval, user_id: user.id } },
      metadata: { product: "unique_subscription", tier, billing: interval, user_id: user.id },
      success_url: `${origin}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscription?canceled=1`,
      allow_promotion_codes: true });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200 });
  } catch (e) {
    console.error("[create-subscription-checkout]", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
