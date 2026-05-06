import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Server-controlled insurance plans (EUR cents/month). Never trust client prices.
const PLANS: Record<string, { amount: number; name: string; maxClaims: number }> = {
  basic: { amount: 999, name: "Emotion Insurance — Basic Protection", maxClaims: 5 },
  standard: { amount: 1499, name: "Emotion Insurance — Standard Protection", maxClaims: 10 },
  premium: { amount: 2499, name: "Emotion Insurance — Premium Protection", maxClaims: 9999 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authorization required");
    const supa = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const { data: { user } } = await supa.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user?.email) throw new Error("Not authenticated");

    const body = await req.json().catch(() => ({}));
    const level = String(body?.level ?? "").toLowerCase();
    const plan = PLANS[level];
    if (!plan) throw new Error("Invalid plan level");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const origin = req.headers.get("origin") || "https://uniqueapp.fun";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: plan.name },
          unit_amount: plan.amount,
          recurring: { interval: "month" },
        },
        quantity: 1,
      }],
      mode: "subscription",
      metadata: {
        product_type: "emotion_insurance",
        coverage_level: level,
        max_claims: String(plan.maxClaims),
        monthly_price: String(plan.amount / 100),
        user_id: user.id,
      },
      subscription_data: {
        metadata: {
          product_type: "emotion_insurance",
          coverage_level: level,
          user_id: user.id,
        },
      },
      success_url: `${origin}/emotion-economy?insurance=success&level=${level}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/emotion-economy?insurance=canceled`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[create-emotion-insurance-checkout]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
