import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Configurable via env so admin can swap price IDs without redeploy.
const TIERS: Record<string, { name: string; price_eur: number; default_price_env: string }> = {
  pro:   { name: "IQ Pro",   price_eur: 9.99,  default_price_env: "IQ_PRO_PRICE_ID" },
  elite: { name: "IQ Elite", price_eur: 19.99, default_price_env: "IQ_ELITE_PRICE_ID" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user?.email) throw new Error("Unauthenticated");

    const { tier = "pro", priceId } = await req.json().catch(() => ({}));
    const tierCfg = TIERS[tier];
    if (!tierCfg) throw new Error(`Unknown tier: ${tier}`);

    const resolvedPrice = priceId || Deno.env.get(tierCfg.default_price_env);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Find or create customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      mode: "subscription",
      success_url: `${origin}/iq?subscribed=true`,
      cancel_url: `${origin}/iq?subscribed=false`,
      metadata: { user_id: user.id, iq_tier: tier },
    };

    if (resolvedPrice) {
      sessionParams.line_items = [{ price: resolvedPrice, quantity: 1 }];
    } else {
      // Fallback: create inline price (test mode safe)
      sessionParams.line_items = [{
        price_data: {
          currency: "eur",
          recurring: { interval: "month" },
          unit_amount: Math.round(tierCfg.price_eur * 100),
          product_data: { name: tierCfg.name },
        },
        quantity: 1,
      }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
