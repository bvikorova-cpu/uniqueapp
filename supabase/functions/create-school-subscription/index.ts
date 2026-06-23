import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRICE_BY_TIER: Record<string, { priceId: string; name: string }> = {
  kindergarten: { priceId: "price_1TlW0UGaXSfGtYFtUzz6KiLb", name: "Kindergarten Starter" },
  elementary:   { priceId: "price_1TlW0VGaXSfGtYFtITtkl24X", name: "Elementary Standard" },
  premium:      { priceId: "price_1TlW0WGaXSfGtYFt5YxXqOsA", name: "School Premium" },
};

const log = (s: string, d?: unknown) =>
  console.log(`[CREATE-SCHOOL-SUB] ${s}${d ? " " + JSON.stringify(d) : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { tier } = await req.json();
    const cfg = PRICE_BY_TIER[tier];
    if (!cfg) throw new Error(`Unknown tier: ${tier}`);

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
    log("user", { id: user.id, tier });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const origin = req.headers.get("origin") || "https://uniqueapp.fun";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: cfg.priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/coloring-pages?tab=schools&checkout=success`,
      cancel_url: `${origin}/coloring-pages?tab=schools&checkout=cancel`,
      metadata: { kind: "school_subscription", tier_id: tier, plan_name: cfg.name, user_id: user.id },
      subscription_data: {
        metadata: { kind: "school_subscription", tier_id: tier, plan_name: cfg.name, user_id: user.id },
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
