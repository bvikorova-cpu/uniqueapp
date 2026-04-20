// Univerzálna check-subscription funkcia
// Nahrádza 17 check-*-subscription funkcií
// Použitie: supabase.functions.invoke('check-subscription', { body: { tier: 'pet' } })

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (s: string, d?: unknown) => console.log(`[CHECK-SUB] ${s}${d ? ` ${JSON.stringify(d)}` : ""}`);

// Maps tier → array of Stripe Product IDs that grant access
// Add real product IDs as you create them in Stripe.
const TIER_PRODUCTS: Record<string, string[]> = {
  // generic
  premium: [],
  vip: [],
  // hub-specific (fill in as products are created)
  pet: [],
  kids: [],
  kids_story: [],
  kids_reading: [],
  wellness: [],
  psychology: [],
  best_friend: [],
  companions: [],
  creator: [],
  decor: [],
  f1: [],
  future_face: [],
  healthcare: [],
  holographic: [],
  lottery: [],
  masterchef: [],
  phobia: [],
  shadow: [],
  skill_swap: [],
  science: [],
  sports: [],
  time_capsule: [],
  time_reversal: [],
  tipster: [],
  analyzer: [],
  astrology: [],
  anonymous_date: [],
  coloring: [],
  employer: [],
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

    let tier = "premium";
    try {
      const body = await req.json();
      tier = (body?.tier as string) ?? "premium";
    } catch { /* GET or empty body */ }
    log("checking", { tier });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ subscribed: false, tier, reason: "no-auth" }, 200);
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabaseClient.auth.getUser(token);
    if (userErr || !userData.user?.email) {
      return json({ subscribed: false, tier, reason: "invalid-auth" }, 200);
    }
    const user = userData.user;

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      return json({ subscribed: false, tier, product_id: null, subscription_end: null }, 200);
    }
    const customerId = customers.data[0].id;

    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    });

    if (subs.data.length === 0) {
      return json({ subscribed: false, tier, product_id: null, subscription_end: null }, 200);
    }

    const allowedProducts = TIER_PRODUCTS[tier] ?? [];
    let matchedProduct: string | null = null;
    let subscriptionEnd: string | null = null;
    let hasAccess = false;

    for (const sub of subs.data) {
      for (const item of sub.items.data) {
        const productId = typeof item.price.product === "string" ? item.price.product : item.price.product.id;
        // If tier has no specific list, ANY active subscription grants access
        // (useful while products are being mapped). Otherwise must match.
        if (allowedProducts.length === 0 || allowedProducts.includes(productId)) {
          matchedProduct = productId;
          subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();
          hasAccess = true;
          break;
        }
      }
      if (hasAccess) break;
    }

    return json({
      subscribed: hasAccess,
      tier,
      product_id: matchedProduct,
      subscription_end: subscriptionEnd,
    }, 200);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log("ERROR", msg);
    return json({ subscribed: false, error: msg }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}
