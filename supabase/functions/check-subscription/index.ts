// Universal check-subscription function
// Replaces 17 check-*-subscription functions
// Usage: supabase.functions.invoke('check-subscription', { body: { tier: 'pet' } })

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };

const log = (s: string, d?: unknown) => console.log(`[CHECK-SUB] ${s}${d ? ` ${JSON.stringify(d)}` : ""}`);

// Maps tier → array of Stripe Product IDs that grant access.
// SECURITY: tier-specific lists prevent cross-module access (e.g. an Astrology
// subscriber must NOT unlock F1 / Kids / Companions). Tiers without a list fall
// back to "any active subscription" — keep that list short and intentional.
const TIER_PRODUCTS: Record<string, string[]> = { // generic — any active sub
  premium: [],
  vip: [],

  // Phase 2 — explicit product mapping
  best_friend:    ["prod_UNhZqCmnlvoxOc"],
  companions:     ["prod_UNhZr9gtoc34Tc"],
  // prod_UzbqtwCxUzH2q5 = Pro Designer €9.99/month (current price price_1Tzccg...)
  decor:          ["prod_UNhZNhxto4L3rY", "prod_UzbqtwCxUzH2q5"],
  f1:             ["prod_UNhZ4YdjqCy4xv"],
  // Kids Gold Pass (prod_UbEDgqmGITgxMA) + monthly/annual Kids subscriptions
  // (prod_TPWmSQy8vJrtpe, prod_TPWmNY3AZcnjUH) unlock ALL Kids modules
  // (homework, story, reading, drawing, science, ...) via a single purchase.
  kids_story:     ["prod_UNhZq78Jlm6UT4", "prod_TPX3oaWoixWYxy", "prod_TPX3I7KEMWnDQb", "prod_UbEDgqmGITgxMA", "prod_TPWmSQy8vJrtpe", "prod_TPWmNY3AZcnjUH"],
  kids:           ["prod_UNhZeoa304UJXT", "prod_TOhBTCURKFnRuI", "prod_TOhjk0jsMVNpN3", "prod_UbEDgqmGITgxMA", "prod_TPWmSQy8vJrtpe", "prod_TPWmNY3AZcnjUH"],
  science:        ["prod_UNhZeuOF4WDESB", "prod_UbEDgqmGITgxMA", "prod_TPWmSQy8vJrtpe", "prod_TPWmNY3AZcnjUH"],
  kids_reading:   ["prod_UNhZJhIsTqwJbq", "prod_TPoGmcPx8m3Zjr", "prod_UbEDgqmGITgxMA", "prod_TPWmSQy8vJrtpe", "prod_TPWmNY3AZcnjUH"],
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

  // Unique verification tiers (also checked against active Stripe subscriptions)
  verified: ["prod_Uv3ypuicAkRhPQ"],
  plus:     ["prod_Uv3ypuicAkRhPQ", "prod_Uv3yfHQnRojLuQ"],
  pro:      ["prod_Uv3ypuicAkRhPQ", "prod_Uv3yfHQnRojLuQ", "prod_Uv3yBGmooRzvPf"] };

// Stripe Price IDs that grant access to a tier (used when product IDs are not
// known in code or when a product has multiple active prices). Kept separate
// from TIER_PRODUCTS so product matching stays primary while price fallback is
// explicit and auditable.
const TIER_PRICE_IDS: Record<string, string[]> = {
  kids: [
    "price_1SShj2GaXSfGtYFtcKlTJYGa", // Unique Kids Monthly
    "price_1SShj3GaXSfGtYFtGEneXVhs", // Unique Kids Annual
    "price_1TxjDqGaXSfGtYFtd03IWhdy", // Unique Kids Gold Pass
  ],
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

    // ─── UNIQUE VERIFICATION TIER CHECK (DB-first) ───
    // Reads the profile verification_tier so one-time Verified payments also
    // grant access, even when Stripe has no active subscription.
    const verificationTiers = new Set(["verification", "verified", "plus", "pro"]);
    if (verificationTiers.has(tier)) {
      const profileRes = await supabaseClient
        .from("profiles")
        .select("verification_tier, verification_expires_at")
        .eq("id", user.id)
        .single();
      const profileTier = (profileRes.data?.verification_tier as string) ?? "none";
      const expiresAt = profileRes.data?.verification_expires_at;
      const now = new Date();
      const notExpired = !expiresAt || new Date(expiresAt) > now;
      const tierRank: Record<string, number> = { none: 0, verified: 1, plus: 2, pro: 3 };
      const requestedRank = tierRank[tier] ?? 0;
      const userRank = tierRank[profileTier] ?? 0;
      const hasAccess = notExpired && userRank >= requestedRank;

      if (hasAccess || tier === "verification") { return json({
          subscribed: hasAccess,
          tier: profileTier,
          product_id: null,
          subscription_end: expiresAt,
          verification: true }, 200);
      }
    }

    // Skills Marketplace and Skill Swap are distinct subscriptions.

    const cloneTiers = new Set(["clone", "clone_basic", "clone_advanced", "clone_celebrity"]);
    if (cloneTiers.has(tier)) {
      const cloneTier = tier.startsWith("clone_") ? tier.replace("clone_", "") : null;
      let query = supabaseClient
        .from("clone_subscriptions")
        .select("tier, expires_at")
        .eq("user_id", user.id)
        .eq("status", "active")
        .gt("expires_at", new Date().toISOString());
      if (cloneTier) query = query.eq("tier", cloneTier);
      const { data: cloneSub } = await query
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return json({
        subscribed: !!cloneSub,
        tier: cloneSub?.tier ?? tier,
        product_id: null,
        subscription_end: cloneSub?.expires_at ?? null }, 200);
    }


    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      return json({ subscribed: false, tier, product_id: null, subscription_end: null }, 200);
    }
    const customerId = customers.data[0].id;

    const subs = await stripe.subscriptions.list({ customer: customerId,
      status: "active",
      limit: 10 });

    if (subs.data.length === 0) {
      return json({ subscribed: false, tier, product_id: null, subscription_end: null }, 200);
    }

    const allowedProducts = TIER_PRODUCTS[tier] ?? [];
    const allowedPriceIds = TIER_PRICE_IDS[tier] ?? [];
    let matchedProduct: string | null = null;
    let subscriptionEnd: string | null = null;
    let hasAccess = false;

    for (const sub of subs.data) {
      for (const item of sub.items.data) {
        const productId = typeof item.price.product === "string" ? item.price.product : item.price.product.id;
        const priceId = item.price.id;
        // If tier has no specific list, ANY active subscription grants access
        // (useful while products are being mapped). Otherwise must match product
        // or exact price ID.
        const metadataProduct = (sub.metadata?.product || sub.metadata?.type || "").toString();
        const marketplaceMetadataMatch = tier === "skills_marketplace" && metadataProduct === "skills_marketplace";
        if (marketplaceMetadataMatch || (tier !== "skills_marketplace" && (allowedProducts.length === 0 || allowedProducts.includes(productId) || allowedPriceIds.includes(priceId)))) {
          matchedProduct = productId;
          // Stripe moved current_period_end onto subscription items in newer API
          // versions; fall back safely so we never build an invalid Date.
          const periodEnd =
            (item as any).current_period_end ??
            (sub as any).current_period_end ??
            (sub as any).cancel_at ??
            null;
          subscriptionEnd =
            typeof periodEnd === "number" && Number.isFinite(periodEnd)
              ? new Date(periodEnd * 1000).toISOString()
              : null;
          hasAccess = true;
          break;
        }
      }
      if (hasAccess) break;
    }

    // Keep the DB membership synchronized so listing RLS can enforce paid entry.
    if (tier === "skills_marketplace") {
      if (hasAccess) {
        await supabaseClient.from("marketplace_subscriptions").upsert({
          user_id: user.id,
          status: "active",
          started_at: new Date().toISOString(),
          expires_at: subscriptionEnd,
        }, { onConflict: "user_id" });
      } else {
        await supabaseClient
          .from("marketplace_subscriptions")
          .update({ status: "expired" })
          .eq("user_id", user.id);
      }
    }

    // ─── Home Decor: keep the decor_subscriptions row in sync with Stripe ───
    // generate-room-design gates on that row, so a paid checkout that never
    // reached the webhook still unlocks design generation here.
    if (tier === "decor" && hasAccess) {
      const { data: existing } = await supabaseClient
        .from("decor_subscriptions")
        .select("designs_used, designs_limit")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!existing) {
        await supabaseClient.from("decor_subscriptions").upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
          plan_type: "pro",
          status: "active",
          designs_used: 0,
          designs_limit: 50,
          current_period_start: new Date().toISOString(),
          current_period_end: subscriptionEnd,
          updated_at: new Date().toISOString() }, { onConflict: "user_id" });
      } else {
        await supabaseClient.from("decor_subscriptions")
          .update({ status: "active", current_period_end: subscriptionEnd, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);
      }
      return json({ subscribed: true,
        tier,
        product_id: matchedProduct,
        subscription_end: subscriptionEnd,
        designs_used: existing?.designs_used ?? 0,
        designs_limit: existing?.designs_limit ?? 50 }, 200);
    }

    return json({ subscribed: hasAccess,
      tier,
      product_id: matchedProduct,
      subscription_end: subscriptionEnd }, 200);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log("ERROR", msg);
    return json({ subscribed: false, error: msg }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status });
}
