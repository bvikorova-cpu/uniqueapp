import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TIER_BY_PRICE: Record<string, string> = {
  price_1TlWB3GaXSfGtYFtwmGHpzLV: "pediatric_mini",
  price_1TlWB4GaXSfGtYFtFc4g2deu: "pediatric_standard",
  price_1TlWB4GaXSfGtYFtNjWmwe9X: "therapy_professional",
  price_1TlWB5GaXSfGtYFthkRtD9Jx: "clinic_premium",
};

const log = (s: string, d?: unknown) =>
  console.log(`[CHECK-HEALTHCARE-SUB] ${s}${d ? " " + JSON.stringify(d) : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const { data: userData, error: userErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userErr || !userData.user?.email) throw new Error("Not authenticated");
    const user = userData.user;

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const empty = {
      subscribed: false,
      subscription_tier: null,
      subscription_status: null,
      subscription_end: null,
    };
    if (customers.data.length === 0) {
      return new Response(JSON.stringify(empty), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subs = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: "active",
      limit: 100,
    });
    const match = subs.data.find((s) => {
      if (s.metadata?.kind === "healthcare_subscription") return true;
      return s.items.data.some((it) => TIER_BY_PRICE[it.price.id]);
    });
    if (!match) {
      return new Response(JSON.stringify(empty), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const priceId = match.items.data[0]?.price.id;
    const tier = TIER_BY_PRICE[priceId] ?? null;
    log("active", { sub: match.id, tier });
    return new Response(
      JSON.stringify({
        subscribed: true,
        subscription_tier: tier,
        subscription_status: match.status,
        subscription_end: new Date(match.current_period_end * 1000).toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log("ERROR", { msg });
    return new Response(
      JSON.stringify({ error: msg, subscribed: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  }
});
