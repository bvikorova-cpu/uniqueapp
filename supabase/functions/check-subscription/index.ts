// Universal check-subscription function
// Replaces 17 check-*-subscription functions
// Usage: supabase.functions.invoke('check-subscription', { body: { tier: 'pet' } })

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (s: string, d?: unknown) => console.log(`[CHECK-SUB] ${s}${d ? ` ${JSON.stringify(d)}` : ""}`);

// Maps tier → array of Stripe Product IDs that grant access.
// SECURITY: tier-specific lists prevent cross-module access (e.g. an Astrology
// subscriber must NOT unlock F1 / Kids / Companions). Tiers without a list fall
// back to "any active subscription" — keep that list short and intentional.
const TIER_PRODUCTS: Record<string, string[]> = {
  // generic — any active sub
  premium: [],
  vip: [],

  // Phase 2 — explicit product mapping
  best_friend:    ["prod_UNhZqCmnlvoxOc"],
  companions:     ["prod_UNhZr9gtoc34Tc"],
  decor:          ["prod_UNhZNhxto4L3rY"],
  f1:             ["prod_UNhZ4YdjqCy4xv"],
  kids_story:     ["prod_UNhZq78Jlm6UT4", "prod_TPX3oaWoixWYxy", "prod_TPX3I7KEMWnDQb"],
  kids:           ["prod_UNhZeoa304UJXT", "prod_TOhBTCURKFnRuI", "prod_TOhjk0jsMVNpN3"],
  science:        ["prod_UNhZeuOF4WDESB"],
  kids_reading:   ["prod_UNhZJhIsTqwJbq", "prod_TPoGmcPx8m3Zjr"],
  anonymous_date: ["prod_UNhZFpv835vyrL"],

  // Already-mapped legacy tiers
  masterchef:     ["prod_TMRUCoB3rBTawE"],
  shadow:         ["prod_TU3PbgBlAnar5A", "prod_TSzyqkMofSNRNN"],
  employer:       ["prod_TOAOrEnRtpLdJq", "prod_TOAP0gwcYMZAV7"],
  healthcare:     [
    "prod_TOiUnKbNiFrw9m", "prod_TOiVcKvLTfnXvq", "prod_TOiVc2GdFLqEWB",
    "prod_TOifzd5SCtIiJ2", "prod_TOigeiVz7ZtHdr",
  ],
  teen_career:    ["prod_TPpSLmFyniEytR"],
  pet:            ["prod_Ufmdb3lcGFyQ58", "prod_TMxI5ZbjB28R6Z", "prod_TMxIMYFcwmvzvV"],
  future_face:    ["prod_TN6N3EoTKAulED", "prod_TN6cn9F2NV3vo5"],

  // Tiers gated by the universal "UniqueApp Premium – All Modules" subscription
  // (prod_UO5XctMmRHmIpM, €9.99/month). Adding more product IDs here later
  // enables module-specific premium tiers.
  psychology:    ["prod_UO5XctMmRHmIpM"],
  creator:       ["prod_UO5XctMmRHmIpM"],
  holographic:   ["prod_UO5XctMmRHmIpM"],
  lottery:       ["prod_UO5XctMmRHmIpM"],
  phobia:        ["prod_UO5XctMmRHmIpM"],
  skill_swap:    ["prod_UO5XctMmRHmIpM"],
  sports:        ["prod_UO5XctMmRHmIpM"],
  time_capsule:  ["prod_UO5XctMmRHmIpM"],
  time_reversal: ["prod_UO5XctMmRHmIpM"],
  tipster:       ["prod_UO5XctMmRHmIpM"],
  analyzer:      ["prod_UO5XctMmRHmIpM"],
  astrology:     ["prod_UO5XctMmRHmIpM"],
  coloring:      ["prod_UO5XctMmRHmIpM"],
  wellness:      ["prod_UO5XctMmRHmIpM"],
  crystal:       ["prod_UXTyxI4d06YsU6"],
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
