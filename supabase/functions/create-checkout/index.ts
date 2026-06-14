import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { authenticateUser, createSupabaseAdminClient } from "../_shared/supabaseClient.ts";
import { createLogger } from "../_shared/logger.ts";
import { errorResponse, handleCors, successResponse } from "../_shared/response.ts";
import { createStripeClient, getStripeCustomer } from "../_shared/stripe.ts";
import { RATE_LIMITS, withRateLimit } from "../_shared/rateLimit.ts";
import { getFeeRate } from "../_shared/feeRates.ts";

const log = createLogger("CREATE-CHECKOUT");

// Per-category platform fee percentages — mirror process_campaign_donation RPC
const CAMPAIGN_FEE_PCT: Record<string, number> = {
  medical: 0.06, dream: 0.07, hero: 0.05, pet: 0.06,
  student: 0.05, crisis: 0.08, talent: 0.10,
};
const CAMPAIGN_TABLE: Record<string, string> = {
  medical: "medical_campaigns", dream: "dream_campaigns", hero: "hero_campaigns",
  pet: "pet_rescue_campaigns", student: "student_campaigns",
  crisis: "crisis_campaigns", talent: "talent_campaigns",
};


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEFAULT_APP_ORIGIN = "https://uniqueapp.fun";

function normalizeOrigin(value: string | null) {
  if (!value || value === "null") return DEFAULT_APP_ORIGIN;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.origin : DEFAULT_APP_ORIGIN;
  } catch {
    return DEFAULT_APP_ORIGIN;
  }
}

const ANTIQUE_PRICE_IDS: Record<number, string> = {
  10: "price_1SOII2GaXSfGtYFtPltUZvxb",
  25: "price_1SOIIMGaXSfGtYFtonaY4jqs",
  60: "price_1SOIItGaXSfGtYFtvHTuEutU",
  150: "price_1SOIJE0QTWhd4oRpow80Xeyd",
};

// ─── Universal credit pack price-ID map ───
// All AI-credit modules. Frontend sends: { creditType: "iq", credits: 10 }
// Routes to the correct success URL automatically.
const CREDIT_PACKS: Record<string, { prices: Record<number, string>; successPath: string; cancelPath: string }> = {
  antique: {
    prices: ANTIQUE_PRICE_IDS,
    successPath: "/antique-appraisal?payment=success&session_id={CHECKOUT_SESSION_ID}",
    cancelPath: "/antique-appraisal?payment=canceled",
  },
  collectibles: {
    // Reuses antique price IDs (same pack sizes 10/25/60/150 at €5/€10/€20/€40).
    // Credits land in `ai_credits` via verify-payment mapping.
    prices: ANTIQUE_PRICE_IDS,
    successPath: "/collectibles?payment=success&session_id={CHECKOUT_SESSION_ID}",
    cancelPath: "/collectibles?payment=canceled",
  },
  handwriting: {
    prices: {
      10: "price_1SZppoGaXSfGtYFt9LcYpN4i",
      25: "price_1SZppoGaXSfGtYFtj5zdmxHz",
      50: "price_1SZpppGaXSfGtYFt8FztYCdY",
      100: "price_1SZppqGaXSfGtYFt7w4oht6d",
    },
    successPath: "/handwriting?payment=success&session_id={CHECKOUT_SESSION_ID}",
    cancelPath: "/handwriting?payment=cancelled",
  },
  iq: {
    prices: {
      10: "price_1SX7FLGaXSfGtYFtf8qA5DjG",
      20: "price_1SX7FNGaXSfGtYFtdIP9DTj6",
      50: "price_1SX7FOGaXSfGtYFtIoxAWZen",
    },
    successPath: "/iq-platform?payment=success&session_id={CHECKOUT_SESSION_ID}",
    cancelPath: "/iq-platform?payment=canceled",
  },
  analyzer: {
    prices: {
      10: "price_1TPJLxGaXSfGtYFtRTA10da3",
      25: "price_1TPJLyGaXSfGtYFt43bltMZ4",
      50: "price_1TPJLzGaXSfGtYFti6HMW0YE",
      100: "price_1TPJM0GaXSfGtYFtng6TFukX",
    },
    successPath: "/analyzer?payment=success&session_id={CHECKOUT_SESSION_ID}",
    cancelPath: "/analyzer?payment=canceled",
  },
  cooking: {
    prices: {
      10: "price_1TPJM0GaXSfGtYFtB3lzN2mp",
      25: "price_1TPJM1GaXSfGtYFthFsY16up",
      50: "price_1TPJM2GaXSfGtYFtCTo0uRPg",
      100: "price_1TPJM2GaXSfGtYFt3L149zZd",
    },
    successPath: "/cooking?payment=success&session_id={CHECKOUT_SESSION_ID}",
    cancelPath: "/cooking?payment=canceled",
  },
  video_ad: {
    prices: {
      10: "price_1TPJM3GaXSfGtYFtC5i9Zn9A",
      25: "price_1TPJM4GaXSfGtYFthfHhDpTD",
      50: "price_1TPJM5GaXSfGtYFttZadmLHY",
      100: "price_1TPJM6GaXSfGtYFtmFAObbIW",
    },
    successPath: "/video-ad-creator?payment=success&session_id={CHECKOUT_SESSION_ID}",
    cancelPath: "/video-ad-creator?payment=canceled",
  },
  astrology: {
    // Stale fixed price IDs were not present in Stripe — use dynamic price_data
    // (€0.50/credit fallback in the credits branch). 10→€5, 25→€12.50, 50→€25, 100→€50.
    prices: {},
    successPath: "/astrology?payment=success&session_id={CHECKOUT_SESSION_ID}",
    cancelPath: "/astrology?payment=canceled",
  },
  // Character Arena credits — dynamic price_data. 50 → €9.99, 200 → €29.99
  character_arena: {
    prices: {},
    successPath: "/character-arena?payment=success&session_id={CHECKOUT_SESSION_ID}",
    cancelPath: "/character-arena?payment=canceled",
  },
  // Science Lab credits — dynamic price_data fallback (€0.50/credit) until fixed prices created
  science: {
    prices: {},
    successPath: "/kids-science-lab?payment=success&session_id={CHECKOUT_SESSION_ID}",
    cancelPath: "/kids-science-lab?payment=canceled",
  },
  // Homework Helper credits — dynamic price_data (€0.50/credit) until fixed prices created
  homework: {
    prices: {},
    successPath: "/kids-homework?payment=success&session_id={CHECKOUT_SESSION_ID}",
    cancelPath: "/kids-homework?payment=canceled",
  },
  // Character Chat credits — dynamic price_data (€0.10/message, 1 credit = 1 message)
  chat: {
    prices: {},
    successPath: "/kids-voice-chat?payment=success&session_id={CHECKOUT_SESSION_ID}",
    cancelPath: "/kids-voice-chat?payment=canceled",
  },
  // Kids Drawing Buddy credits — dynamic price_data (€0.50/credit) — AI image analysis & transformation
  kids_drawing: {
    prices: {},
    successPath: "/kids-drawing-buddy?payment=success&session_id={CHECKOUT_SESSION_ID}",
    cancelPath: "/kids-drawing-buddy?payment=canceled",
  },
  // Kids Reading Companion credits — dynamic price_data (€0.50/credit) — AI reading analysis & quizzes
  kids_reading: {
    prices: {},
    successPath: "/kids-reading-companion?payment=success&session_id={CHECKOUT_SESSION_ID}",
    cancelPath: "/kids-reading-companion?payment=canceled",
  },
  // Kids Story Creator credits — dynamic price_data (€0.50/credit) — AI story generation
  kids_story: {
    prices: {},
    successPath: "/kids-story-creator?payment=success&session_id={CHECKOUT_SESSION_ID}",
    cancelPath: "/kids-story-creator?payment=canceled",
  },
  // Kids Academy Hub credits — daily plans, recommendations, parent digest
  kids_academy: {
    prices: {},
    successPath: "/kids-academy?payment=success&session_id={CHECKOUT_SESSION_ID}",
    cancelPath: "/kids-academy?payment=canceled",
  },
  // Teen Career Counselor credits — dynamic price_data (€0.50/credit) — AI guidance sessions (5 credits/session)
  teen_career: {
    prices: {},
    successPath: "/teen-career-counselor?payment=success&session_id={CHECKOUT_SESSION_ID}",
    cancelPath: "/teen-career-counselor?payment=canceled",
  },
  // Teen Hub — unified credits for all Teen AI modules (€0.50/credit, dynamic)
  teen_hub: {
    prices: {},
    successPath: "/teen-hub?payment=success&session_id={CHECKOUT_SESSION_ID}",
    cancelPath: "/teen-hub?payment=canceled",
  },
  // Coloring Pages credits — dynamic price_data (€0.50/credit) — 5 credits per page
  coloring: {
    prices: {},
    successPath: "/coloring-pages?payment=success&session_id={CHECKOUT_SESSION_ID}",
    cancelPath: "/coloring-pages?payment=canceled",
  },
  // ─── Newly created Phase 3 packs ───
  character: {
    prices: {
      10: "price_1TOwfSGaXSfGtYFtapoRaNMl",
      30: "price_1TOwfTGaXSfGtYFtyBmPvW8q",
      100: "price_1TOwfUGaXSfGtYFtCCUOJzbI",
    },
    successPath: "/ai-characters?payment=success&session_id={CHECKOUT_SESSION_ID}",
    cancelPath: "/ai-characters?payment=canceled",
  },
  creative_forge: {
    // Legacy fixed Stripe prices (10/30/100). Public packages 30/75/150/400
    // fall through to dynamic price_data below using CREATIVE_FORGE_PRICES.
    prices: {
      10: "price_1TOwfVGaXSfGtYFtTuoGa1FZ",
      30: "price_1TOwfWGaXSfGtYFt6V478VoY",
      100: "price_1TOwfXGaXSfGtYFtTWK7Sbf8",
    },
    successPath: "/creative-forge?payment=success&session_id={CHECKOUT_SESSION_ID}",
    cancelPath: "/creative-forge?payment=canceled",
  },
  coloring: {
    prices: {
      10: "price_1TOwfYGaXSfGtYFtHr3dSsW1",
      30: "price_1TOwfZGaXSfGtYFthcYmlxhm",
      100: "price_1TOwfaGaXSfGtYFtlqeVcsSl",
    },
    successPath: "/coloring?payment=success&session_id={CHECKOUT_SESSION_ID}",
    cancelPath: "/coloring?payment=canceled",
  },
  // Shadow Arena AI credits — dynamic pricing via SHADOW_ARENA_TOTALS below.
  // Public packages: 30 (€4.99), 100 (€12.99), 280 (€29.99).
  shadow_arena: {
    prices: {},
    successPath: "/shadow-arena/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}",
    cancelPath: "/shadow-arena/dashboard?payment=canceled",
  },
};

const SPORTS_PACKS: Record<string, Record<string, { amount: number; coins: number }>> = {
  football_coins: {
    price_football_1000: { amount: 299, coins: 1000 },
    price_football_5000: { amount: 999, coins: 5000 },
    price_football_15000: { amount: 2499, coins: 15000 },
    price_football_50000: { amount: 4999, coins: 50000 },
  },
  basketball_coins: {
    price_basketball_1000: { amount: 499, coins: 1000 },
    price_basketball_3000: { amount: 999, coins: 3000 },
    price_basketball_7000: { amount: 1999, coins: 7000 },
    price_basketball_15000: { amount: 3999, coins: 15000 },
  },
  hockey_coins: {
    price_hockey_1000: { amount: 499, coins: 1000 },
    price_hockey_3000: { amount: 999, coins: 3000 },
    price_hockey_7000: { amount: 1999, coins: 7000 },
    price_hockey_15000: { amount: 3999, coins: 15000 },
  },
  tennis_coins: {
    price_tennis_1000: { amount: 499, coins: 1000 },
    price_tennis_3000: { amount: 999, coins: 3000 },
    price_tennis_7000: { amount: 1999, coins: 7000 },
    price_tennis_15000: { amount: 3999, coins: 15000 },
  },
  af_coins: {
    price_af_1000: { amount: 499, coins: 1000 },
    price_af_3000: { amount: 999, coins: 3000 },
    price_af_7000: { amount: 1999, coins: 7000 },
    price_af_15000: { amount: 3999, coins: 15000 },
  },
};

const DEFAULT_PATHS: Record<string, { success: string; cancel: string }> = {
  antique_credits: { success: "/antique-appraisal?payment=success&session_id={CHECKOUT_SESSION_ID}", cancel: "/antique-appraisal?payment=canceled" },
  best_friend: { success: "/best-friend?payment=success&session_id={CHECKOUT_SESSION_ID}", cancel: "/best-friend?payment=canceled" },
  best_friend_messages: { success: "/best-friend?payment=success&session_id={CHECKOUT_SESSION_ID}&pack=messages", cancel: "/best-friend?payment=canceled" },
  basketball_coins: { success: "/basketball-arena?payment=success&session_id={CHECKOUT_SESSION_ID}", cancel: "/basketball-arena?payment=canceled" },
  football_coins: { success: "/football-arena?payment=success&session_id={CHECKOUT_SESSION_ID}", cancel: "/football-arena?payment=canceled" },
  hockey_coins: { success: "/hockey-arena?payment=success&session_id={CHECKOUT_SESSION_ID}", cancel: "/hockey-arena?payment=canceled" },
  tennis_coins: { success: "/tennis-arena?payment=success&session_id={CHECKOUT_SESSION_ID}", cancel: "/tennis-arena?payment=canceled" },
  af_coins: { success: "/american-football-arena?payment=success&session_id={CHECKOUT_SESSION_ID}", cancel: "/american-football-arena?payment=canceled" },
  clone_subscription: { success: "/ai-clone?payment=success&session_id={CHECKOUT_SESSION_ID}", cancel: "/ai-clone?payment=canceled" },
  clone_dating: { success: "/ai-clone?payment=success&session_id={CHECKOUT_SESSION_ID}", cancel: "/ai-clone?payment=canceled" },
  dating_monthly: { success: "/dating?payment=success&session_id={CHECKOUT_SESSION_ID}", cancel: "/dating?payment=canceled" },
  dating_yearly: { success: "/dating?payment=success&session_id={CHECKOUT_SESSION_ID}", cancel: "/dating?payment=canceled" },
  crystal_energy: { success: "/crystal-energy-network?success=true&session_id={CHECKOUT_SESSION_ID}", cancel: "/crystal-energy-network?canceled=true" },
  shadow_subscription: { success: "/shadow-arena/dashboard?subscription=success&session_id={CHECKOUT_SESSION_ID}", cancel: "/shadow-arena/dashboard?subscription=canceled" },
  property_listing: { success: "/property-marketplace?payment=success&session_id={CHECKOUT_SESSION_ID}", cancel: "/property-marketplace?payment=canceled" },
  lead_boost: { success: "/my-properties?payment=success&session_id={CHECKOUT_SESSION_ID}", cancel: "/my-properties?payment=canceled" },
  virtual_tour: { success: "/property-marketplace?payment=success&session_id={CHECKOUT_SESSION_ID}", cancel: "/property-marketplace?payment=canceled" },
  quantum_profiles: { success: "/quantum-social?payment=success&session_id={CHECKOUT_SESSION_ID}", cancel: "/quantum-social?payment=canceled" },
  observer_mode: { success: "/quantum-social?payment=success&session_id={CHECKOUT_SESSION_ID}", cancel: "/quantum-social?payment=canceled" },
  quantum_entanglement: { success: "/quantum-social?payment=success&session_id={CHECKOUT_SESSION_ID}", cancel: "/quantum-social?payment=canceled" },
};

const CLONE_PRODUCTS: Record<string, { amount: number; mode: "payment" | "subscription"; name: string; metadata: Record<string, string> }> = {
  clone_basic: {
    amount: 999,
    mode: "subscription",
    name: "AI Clone Basic",
    metadata: { type: "clone_subscription", tier: "basic" },
  },
  clone_advanced: {
    amount: 2999,
    mode: "subscription",
    name: "AI Clone Advanced",
    metadata: { type: "clone_subscription", tier: "advanced" },
  },
  clone_celebrity: {
    amount: 9900,
    mode: "subscription",
    name: "AI Clone Celebrity",
    metadata: { type: "clone_subscription", tier: "celebrity" },
  },
  clone_dating: {
    amount: 499,
    mode: "payment",
    name: "Clone Dating Session",
    metadata: { type: "clone_dating" },
  },
};

function stringifyMetadata(input: Record<string, unknown> = {}) {
  return Object.fromEntries(
    Object.entries(input)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => [key, typeof value === "string" ? value : String(value)])
  );
}

function resolveUrls(origin: string, successUrl?: string, cancelUrl?: string, fallbackType?: string) {
  if (successUrl && cancelUrl) {
    return { successUrl, cancelUrl };
  }

  const fallback = fallbackType ? DEFAULT_PATHS[fallbackType] : undefined;

  return {
    successUrl: successUrl || `${origin}${fallback?.success || "/?payment=success&session_id={CHECKOUT_SESSION_ID}"}`,
    cancelUrl: cancelUrl || `${origin}${fallback?.cancel || "/?payment=canceled"}`,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleCors();
  }

  const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.checkout, corsHeaders);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const stripe = createStripeClient();
    const origin = normalizeOrigin(req.headers.get("origin"));

    // Donations support guest checkout — auth is optional
    const isDonation = body.product === "campaign_donation" || body.product === "campaign-donation";
    let userId: string | null = null;
    let email: string | null = null;
    if (isDonation) {
      try {
        const auth = await authenticateUser(req);
        userId = auth.userId;
        email = auth.email ?? null;
      } catch {
        userId = null;
        email = body.donorEmail ? String(body.donorEmail) : null;
      }
      if (!email) throw new Error("Email required for donation (sign in or provide donorEmail)");
    } else {
      const auth = await authenticateUser(req);
      userId = auth.userId;
      email = auth.email ?? null;
      if (!email) throw new Error("User email not available");
    }
    const customerId = await getStripeCustomer(stripe, email);

    // ─── PET TRANSLATOR CHECKOUT ROUTER ───
    // Handles both subscription plans and one-off purchases via priceId.
    // Body: { product: "pet", priceId: "price_..." }
    if (body.product === "pet" && body.priceId) {
      const PET_PRICES = new Set<string>([
        "price_1TgR40GaXSfGtYFt82FwbNXt", // Pet Parent €4.99/mo (prod_Ufmdb3lcGFyQ58)
        "price_1SQDNuGaXSfGtYFt9o91SK2J", // Multi-Pet €8.99/mo
        "price_1SQDOFGaXSfGtYFtDQsh6HlL", // Pet Psychologist €24.99/mo
        "price_1SQDRRGaXSfGtYFts87Q1N9y", // Single translation €2
        "price_1TWBEFGaXSfGtYFtKH2ut18T", // Premium voice €14.99
      ]);
      const priceId = String(body.priceId);
      if (!PET_PRICES.has(priceId)) {
        return errorResponse("Invalid pet priceId", 400);
      }
      const price = await stripe.prices.retrieve(priceId);
      const mode: "subscription" | "payment" = price.recurring ? "subscription" : "payment";
      const successPath = mode === "subscription"
        ? `/pet-translator?subscription=success&session_id={CHECKOUT_SESSION_ID}`
        : `/pet-translator?payment=success&session_id={CHECKOUT_SESSION_ID}`;
      const sessionParams: Record<string, unknown> = {
        line_items: [{ price: priceId, quantity: 1 }],
        mode,
        success_url: `${origin}${successPath}`,
        cancel_url: `${origin}/pet-translator-pricing?payment=canceled`,
        allow_promotion_codes: true,
        metadata: { user_id: userId ?? "", module: "pet_translator", price_id: priceId },
      };
      if (customerId) sessionParams.customer = customerId;
      else if (email) sessionParams.customer_email = email;
      const session = await stripe.checkout.sessions.create(sessionParams);
      return successResponse({ url: session.url, mode });
    }

    // ─── AI CREDITS AUTO-RECHARGE ROUTER ───
    // Consolidates the previous ai-auto-recharge edge function to avoid hitting
    // the Supabase Edge Functions limit. Body: { product: "ai_auto_recharge", action }
    if (body.product === "ai_auto_recharge") {
      if (!userId || !email) throw new Error("Login required");
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.57.2");
      const supa = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } },
      );

      const action = String(body.action || "get_settings");
      const { data: row } = await supa
        .from("ai_credits_auto_recharge")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      const ensureCustomer = async () => {
        if (row?.stripe_customer_id) {
          try {
            const existing = await stripe.customers.retrieve(row.stripe_customer_id);
            if (!(existing as any).deleted) return existing;
          } catch { /* create a replacement below */ }
        }
        if (customerId) return await stripe.customers.retrieve(customerId);
        return await stripe.customers.create({ email, metadata: { user_id: userId } });
      };

      if (action === "get_settings") {
        let paymentMethod: { brand?: string; last4?: string } | null = null;
        if (row?.stripe_payment_method_id) {
          try {
            const pm = await stripe.paymentMethods.retrieve(row.stripe_payment_method_id);
            if (pm.card) paymentMethod = { brand: pm.card.brand, last4: pm.card.last4 };
          } catch (e) { log("AI_AUTO_RECHARGE_PM_ERROR", { message: e instanceof Error ? e.message : String(e) }); }
        }
        return successResponse({ settings: row, paymentMethod });
      }

      if (action === "save_setup_link") {
        const customer = await ensureCustomer();
        const session = await stripe.checkout.sessions.create({
          mode: "setup",
          customer: customer.id,
          payment_method_types: ["card"],
          success_url: `${origin}/ai-credits-store?autorecharge=setup_success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/ai-credits-store?autorecharge=setup_canceled`,
        });

        await supa.from("ai_credits_auto_recharge").upsert({
          user_id: userId,
          stripe_customer_id: customer.id,
          enabled: row?.enabled ?? false,
          threshold: row?.threshold ?? 10,
          package_credits: row?.package_credits ?? 25,
          package_price_eur: row?.package_price_eur ?? 10.00,
        }, { onConflict: "user_id" });

        return successResponse({ url: session.url });
      }

      if (action === "confirm_setup") {
        const sessionId = String(body.session_id || "");
        if (!sessionId) throw new Error("session_id required");
        const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["setup_intent"] });
        const setupIntent = session.setup_intent as any;
        const paymentMethodId = typeof setupIntent === "string" ? null : setupIntent?.payment_method;
        if (!paymentMethodId) throw new Error("No payment method on session");
        const customer = await ensureCustomer();
        await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id }).catch(() => {});
        await stripe.customers.update(customer.id, { invoice_settings: { default_payment_method: paymentMethodId } });

        await supa.from("ai_credits_auto_recharge").upsert({
          user_id: userId,
          stripe_customer_id: customer.id,
          stripe_payment_method_id: paymentMethodId,
          enabled: true,
          threshold: row?.threshold ?? 10,
          package_credits: row?.package_credits ?? 25,
          package_price_eur: row?.package_price_eur ?? 10.00,
        }, { onConflict: "user_id" });

        return successResponse({ ok: true });
      }

      if (action === "save_settings") {
        const enabled = body.enabled === true;
        const threshold = Math.max(1, Math.min(500, Number(body.threshold ?? 10)));
        const packageCredits = Number(body.package_credits ?? 25);
        const packagePriceEur = Number(body.package_price_eur ?? 10);
        if (![10, 25, 60, 150].includes(packageCredits)) throw new Error("Invalid package");

        await supa.from("ai_credits_auto_recharge").upsert({
          user_id: userId,
          enabled,
          threshold,
          package_credits: packageCredits,
          package_price_eur: packagePriceEur,
          stripe_customer_id: row?.stripe_customer_id ?? null,
          stripe_payment_method_id: row?.stripe_payment_method_id ?? null,
        }, { onConflict: "user_id" });

        return successResponse({ ok: true });
      }

      if (action === "disable") {
        await supa.from("ai_credits_auto_recharge").update({ enabled: false }).eq("user_id", userId);
        return successResponse({ ok: true });
      }

      if (action === "charge") {
        if (!row?.enabled) throw new Error("Auto-recharge not enabled");
        if (!row.stripe_customer_id || !row.stripe_payment_method_id) throw new Error("No saved payment method");

        const { data: creditsRow } = await supa
          .from("ai_credits")
          .select("credits_remaining,total_credits_purchased")
          .eq("user_id", userId)
          .maybeSingle();
        const current = Number(creditsRow?.credits_remaining ?? 0);
        if (current > Number(row.threshold)) return successResponse({ skipped: true, reason: "above_threshold", current });

        try {
          const intent = await stripe.paymentIntents.create({
            amount: Math.round(Number(row.package_price_eur) * 100),
            currency: "eur",
            customer: row.stripe_customer_id,
            payment_method: row.stripe_payment_method_id,
            off_session: true,
            confirm: true,
            description: `AI Credits auto-recharge: ${row.package_credits} credits`,
            metadata: { user_id: userId, credits: String(row.package_credits), kind: "ai_credits_auto_recharge" },
          });

          const totalPurchased = Number(creditsRow?.total_credits_purchased ?? 0) + Number(row.package_credits);
          const newBalance = current + Number(row.package_credits);
          if (creditsRow) {
            await supa.from("ai_credits").update({
              credits_remaining: newBalance,
              total_credits_purchased: totalPurchased,
            }).eq("user_id", userId);
          } else {
            await supa.from("ai_credits").insert({
              user_id: userId,
              credits_remaining: newBalance,
              total_credits_purchased: totalPurchased,
            });
          }

          await supa.from("ai_credits_auto_recharge").update({
            last_recharge_at: new Date().toISOString(),
            last_recharge_status: "succeeded",
            last_error: null,
          }).eq("user_id", userId);

          return successResponse({ ok: true, charged: row.package_price_eur, credits_added: row.package_credits, intent_id: intent.id });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          await supa.from("ai_credits_auto_recharge").update({
            last_recharge_at: new Date().toISOString(),
            last_recharge_status: "failed",
            last_error: message.slice(0, 500),
          }).eq("user_id", userId);
          if ((e as any)?.code === "authentication_required") {
            return new Response(JSON.stringify({ error: "authentication_required", message: "Card needs re-authentication. Please update payment method." }), {
              status: 402,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          throw e;
        }
      }

      return errorResponse("Unknown auto-recharge action", 400);
    }

    // ─── COUPON MARKETPLACE: subscription access (€1/mo) ───
    if (body.product === "coupon_marketplace") {
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.57.2");
      const supa = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      if (body.action === "check") {
        if (!userId) return successResponse({ hasAccess: false });
        const { data } = await supa
          .from("coupon_marketplace_access")
          .select("id")
          .eq("user_id", userId)
          .limit(1)
          .maybeSingle();
        return successResponse({ hasAccess: !!data });
      }

      if (body.action === "verify") {
        const sessionId = body.sessionId || body.session_id;
        if (!sessionId) return successResponse({ hasAccess: false, verified: false, error: "Missing sessionId" });
        try {
          const session = await stripe.checkout.sessions.retrieve(sessionId);
          const paid = session.payment_status === "paid" || session.status === "complete";
          if (paid && userId) {
            await supa.from("coupon_marketplace_access").insert({
              user_id: userId,
              amount: (session.amount_total ?? 100) / 100,
              stripe_session_id: sessionId,
            });
          }
          return successResponse({ verified: paid, hasAccess: paid });
        } catch (e) {
          return successResponse({ verified: false, hasAccess: false, error: e instanceof Error ? e.message : String(e) });
        }
      }

      // Default: purchase → create subscription checkout
      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [{
          price_data: {
            currency: "eur",
            unit_amount: 100,
            recurring: { interval: "month" as const },
            product_data: { name: "Coupon Marketplace Access" },
          },
          quantity: 1,
        }],
        mode: "subscription",
        success_url: `${origin}/coupon-marketplace?access=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/coupon-marketplace?access=cancelled`,
        metadata: { user_id: userId ?? "", type: "coupon_marketplace", product: "coupon_marketplace" },
      });
      return successResponse({ url: session.url, session_id: session.id });
    }

    // ─── COUPON PURCHASE: buy individual coupon listing ───
    if (body.product === "coupon" && body.action !== "verify") {
      const couponId = String(body.couponId || body.coupon_id || "");
      if (!couponId) throw new Error("Missing couponId");
      if (!userId) throw new Error("Login required");

      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.57.2");
      const supa = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      const { data: coupon, error: cErr } = await supa
        .from("coupon_listings")
        .select("id, user_id, title, selling_price, is_sold")
        .eq("id", couponId)
        .maybeSingle();
      if (cErr || !coupon) throw new Error("Coupon not found");
      if (coupon.is_sold) throw new Error("Coupon already sold");
      if (coupon.user_id === userId) throw new Error("You cannot purchase your own coupon");

      const amountCents = Math.round(Number(coupon.selling_price) * 100);
      const commission = Math.round(amountCents * 0.10);
      const sellerPayout = amountCents - commission;

      const { data: order, error: oErr } = await supa
        .from("coupon_orders")
        .insert({
          coupon_id: coupon.id,
          buyer_id: userId,
          seller_id: coupon.user_id,
          amount: Number(coupon.selling_price),
          commission_amount: commission / 100,
          seller_payout: sellerPayout / 100,
          status: "pending",
          buyer_email: email,
        })
        .select()
        .single();
      if (oErr || !order) throw new Error(oErr?.message || "Failed to create order");

      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [{
          price_data: {
            currency: "eur",
            unit_amount: amountCents,
            product_data: { name: `Coupon: ${coupon.title}` },
          },
          quantity: 1,
        }],
        mode: "payment",
        success_url: `${origin}/coupon-marketplace?payment=success&session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
        cancel_url: `${origin}/coupon-marketplace?payment=cancelled`,
        metadata: {
          user_id: userId,
          type: "coupon",
          product: "coupon",
          coupon_id: coupon.id,
          order_id: order.id,
        },
      });

      await supa.from("coupon_orders").update({ stripe_session_id: session.id }).eq("id", order.id);

      return successResponse({ url: session.url, session_id: session.id });
    }

    // ─── COUPON VERIFY: confirm payment + mark order/listing sold ───
    if (body.product === "coupon" && body.action === "verify") {
      const sessionId = body.sessionId || body.session_id;
      const orderId = body.orderId || body.order_id;
      if (!sessionId) return successResponse({ verified: false, error: "Missing sessionId" });

      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.57.2");
      const supa = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const paid = session.payment_status === "paid" || session.status === "complete";

        if (paid && orderId) {
          const nowIso = new Date().toISOString();
          // 7-day Buyer Guarantee window
          const autoReleaseAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          await supa.from("coupon_orders").update({
            status: "completed",
            paid_at: nowIso,
            delivered_at: nowIso,
            escrow_status: "held",
            auto_release_at: autoReleaseAt,
          }).eq("id", orderId);

          const { data: ord } = await supa
            .from("coupon_orders")
            .select("coupon_id")
            .eq("id", orderId)
            .maybeSingle();
          if (ord?.coupon_id) {
            await supa.from("coupon_listings")
              .update({ is_sold: true })
              .eq("id", ord.coupon_id);
          }
        }

        return successResponse({ verified: paid, status: session.status, payment_status: session.payment_status });
      } catch (e) {
        return successResponse({ verified: false, error: e instanceof Error ? e.message : String(e) });
      }
    }

    // ─── ACTION: verify (used by all verify-*-payment aliases) ───
    // Verifies a Stripe Checkout session id and returns its status.
    // Body: { action: "verify", sessionId: string, product?: string }
    if (body.action === "verify") {
      const sessionId = body.sessionId || body.session_id;
      if (!sessionId) {
        return successResponse({ verified: false, error: "Missing sessionId" });
      }
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const paid = session.payment_status === "paid" || session.status === "complete";
        return successResponse({
          verified: paid,
          status: session.status,
          payment_status: session.payment_status,
          amount: session.amount_total,
          metadata: session.metadata,
          product: body.product || session.metadata?.type || null,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return successResponse({ verified: false, error: msg });
      }
    }

    // ─── CAMPAIGN DONATION PATH ───
    // Body: { product: "campaign_donation", campaignId, campaignType, amount (EUR),
    //         isMonthly, isAnonymous, message, donorEmail, donorName }
    if (body.product === "campaign_donation" || body.product === "campaign-donation") {
      const campaignId = String(body.campaignId || body.campaign_id || "");
      const campaignType = String(body.campaignType || body.campaign_type || "");
      const donationAmount = Number(body.amount);
      if (!campaignId || !campaignType) throw new Error("Missing campaignId/campaignType");
      if (!Number.isFinite(donationAmount) || donationAmount < 1) {
        throw new Error("Donation amount must be at least 1 EUR");
      }
      const VALID_TYPES = ["medical","dream","hero","pet","student","crisis","talent"];
      if (!VALID_TYPES.includes(campaignType)) {
        throw new Error(`Invalid campaignType: ${campaignType}`);
      }

      const isMonthly = body.isMonthly === true;
      const isAnonymous = body.isAnonymous === true;
      const donorEmail = String(body.donorEmail || email || "");
      const donorName = body.donorName ? String(body.donorName) : "";
      const donationMessage = body.message ? String(body.message) : "";

      const successUrl = `${origin}/fundraising/${campaignType}/${campaignId}?donation=success&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${origin}/fundraising/${campaignType}/${campaignId}?donation=canceled`;

      // ── Stripe Connect: route funds to campaign owner, take platform fee
      let connectAccountId: string | null = null;
      let ownerUserId: string | null = null;
      try {
        const admin = createSupabaseAdminClient();
        const ownerTable = CAMPAIGN_TABLE[campaignType];
        if (ownerTable) {
          const { data: camp } = await admin
            .from(ownerTable)
            .select("user_id")
            .eq("id", campaignId)
            .maybeSingle();
          ownerUserId = (camp as any)?.user_id ?? null;
          if (ownerUserId) {
            const { data: prof } = await admin
              .from("profiles")
              .select("stripe_connect_account_id, stripe_connect_charges_enabled")
              .eq("id", ownerUserId)
              .maybeSingle();
            if (prof?.stripe_connect_account_id && prof.stripe_connect_charges_enabled) {
              connectAccountId = String(prof.stripe_connect_account_id);
            }
          }
        }
      } catch (e) {
        log.error("connect lookup failed", { error: e instanceof Error ? e.message : String(e) });
      }

      const feePct = CAMPAIGN_FEE_PCT[campaignType] ?? 0.05;
      const amountCents = Math.round(donationAmount * 100);
      const feeCents = Math.round(amountCents * feePct);

      const sessionParams: Record<string, unknown> = {
        customer: customerId || undefined,
        customer_email: customerId ? undefined : (donorEmail || email),
        line_items: [{
          price_data: {
            currency: "eur",
            unit_amount: amountCents,
            product_data: {
              name: isMonthly ? `Monthly donation – ${campaignType} campaign` : `Donation – ${campaignType} campaign`,
            },
            ...(isMonthly ? { recurring: { interval: "month" as const } } : {}),
          },
          quantity: 1,
        }],
        mode: isMonthly ? "subscription" : "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          type: "campaign_donation",
          product: "campaign_donation",
          product_type: "donation",
          campaign_id: campaignId,
          campaign_type: campaignType,
          donor_email: donorEmail,
          donor_name: isAnonymous ? "" : donorName,
          is_monthly: String(isMonthly),
          is_anonymous: String(isAnonymous),
          donation_message: donationMessage.slice(0, 450),
          user_id: userId || "",
          owner_user_id: ownerUserId || "",
          platform_fee_pct: String(feePct),
          platform_fee_cents: String(feeCents),
          connect_account_id: connectAccountId || "",
        },
      };

      if (connectAccountId) {
        if (isMonthly) {
          sessionParams.subscription_data = {
            application_fee_percent: Math.round(feePct * 100),
            transfer_data: { destination: connectAccountId },
          };
        } else {
          sessionParams.payment_intent_data = {
            application_fee_amount: feeCents,
            transfer_data: { destination: connectAccountId },
          };
        }
      }

      const session = await stripe.checkout.sessions.create(sessionParams as any);

      return successResponse({ url: session.url, session_id: session.id });
    }


    // ─── PRODUCT-PARAM PATH (used by all create-*-checkout aliases) ───
    // Body: { product: "pet" | "kids" | ..., amount?, productName?, mode?, metadata?, free? }
    // Accept `product_type` as an alias for `product` (used by quantum-social subs)
    if (!body.product && body.product_type) body.product = body.product_type;

    // ─── PLATFORM SUBSCRIPTION (Subscription.tsx) — tier + billing pricing ───
    if (body.product === "subscription" && body.tier) {
      const billing = body.billing === "yearly" ? "yearly" : "monthly";
      const TIERS: Record<string, { monthly: number; yearly: number; name: string }> = {
        basic:    { monthly: 500,  yearly: 4800,  name: "Unique Basic" },
        premium:  { monthly: 1500, yearly: 14400, name: "Unique Premium" },
        business: { monthly: 5000, yearly: 48000, name: "Unique Business" },
      };
      const t = TIERS[String(body.tier)];
      if (t) {
        body.amount = billing === "yearly" ? t.yearly : t.monthly;
        body.productName = `${t.name} (${billing})`;
        body.mode = "subscription";
        body.interval = billing === "yearly" ? "year" : "month";
        body.metadata = { ...(body.metadata || {}), tier: String(body.tier), billing };
        body.successUrl = body.successUrl || `${origin}/subscription?success=true&tier=${body.tier}&session_id={CHECKOUT_SESSION_ID}`;
        body.cancelUrl = body.cancelUrl || `${origin}/subscription?canceled=true`;
      }
    }

    // ─── KIDS SUBSCRIPTION — tier-based real price IDs ───
    if (body.product === "kids_subscription" && body.tier) {
      const KIDS_TIERS: Record<string, { priceId: string; name: string }> = {
        monthly:   { priceId: "price_1SShj2GaXSfGtYFtcKlTJYGa", name: "Unique Kids Monthly" },
        annual:    { priceId: "price_1SShj3GaXSfGtYFtGEneXVhs", name: "Unique Kids Annual" },
        gold_pass: { priceId: "price_1Tc1kyGaXSfGtYFtcfVW1fcY", name: "Unique Kids Gold Pass" },
      };
      const kt = KIDS_TIERS[String(body.tier)];
      if (kt) {
        body.priceId = kt.priceId;
        body.productName = kt.name;
        body.mode = "subscription";
        body.metadata = { ...(body.metadata || {}), tier: String(body.tier), product: "kids_subscription" };
        body.successUrl = body.successUrl || `${origin}/kids-pricing?success=true&tier=${body.tier}&session_id={CHECKOUT_SESSION_ID}`;
        body.cancelUrl = body.cancelUrl || `${origin}/kids-pricing?canceled=true`;
      }
    }

    // ─── B18f PHASE 1 — priceId passthrough for migrated checkouts ───
    // Body: { product: "masterchef" | "time_reversal" | "time_capsule" | "holographic_avatar", priceId, ... }
    const PRICEID_PASSTHROUGH: Record<
      string,
      { mode: "subscription" | "payment"; successPath: string; cancelPath: string; type: string }
    > = {
      masterchef: {
        mode: "subscription",
        successPath: "/masterchef/dashboard?success=true",
        cancelPath: "/masterchef-subscription?canceled=true",
        type: "masterchef_subscription",
      },
      time_reversal: {
        mode: "subscription",
        successPath: "/time-reversal/timeline?success=true",
        cancelPath: "/time-reversal-subscription?canceled=true",
        type: "time_reversal_subscription",
      },
      time_capsule: {
        mode: "payment",
        successPath: "/time-capsule?success=true&session_id={CHECKOUT_SESSION_ID}",
        cancelPath: "/time-capsule-subscription?canceled=true",
        type: "time_capsule",
      },
      holographic_avatar: {
        mode: "payment",
        successPath: "/holographic-avatars?success=true&session_id={CHECKOUT_SESSION_ID}",
        cancelPath: "/holographic-avatars?canceled=true",
        type: "holographic_avatar",
      },
    };
    if (body.product && body.priceId && PRICEID_PASSTHROUGH[String(body.product)]) {
      const cfg = PRICEID_PASSTHROUGH[String(body.product)];
      // holographic_avatar: only the Premium AI Avatar price is a subscription
      let mode: "payment" | "subscription" = cfg.mode;
      if (body.product === "holographic_avatar" && body.priceId === "price_1SPjFEGaXSfGtYFtBjeXRVkk") {
        mode = "subscription";
      }
      const isSubscription = mode === "subscription";
      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [{ price: String(body.priceId), quantity: 1 }],
        mode,
        success_url: `${origin}${cfg.successPath}`,
        cancel_url: `${origin}${cfg.cancelPath}`,
        ...(isSubscription
          ? {
              tax_id_collection: { enabled: true },
              billing_address_collection: "required" as const,
              customer_update: customerId ? { address: "auto" as const, name: "auto" as const } : undefined,
            }
          : {}),
        metadata: {
          user_id: userId ?? "",
          type: cfg.type,
          product: String(body.product),
          ...(body.tier ? { tier: String(body.tier) } : {}),
          ...(body.featureName ? { feature: String(body.featureName) } : {}),
          ...(body.durationYears ? { duration_years: String(body.durationYears) } : {}),
          ...stringifyMetadata(body.metadata || {}),
        },
      });
      return successResponse({ url: session.url, session_id: session.id });
    }

    // ─── B18f PHASE 2 — dynamic price_data packs (no fixed Stripe priceIds) ───
    // Body: { product: "messenger_ai" | "coloring_pay_per_use" | "anonymous_date"
    //                  | "secret_santa" | "emotion_insurance", packKey }
    type DynPkg = { amount: number; credits: number; name: string };
    const DYNAMIC_PACKS: Record<string, {
      packages: Record<string, DynPkg>;
      mode: "payment" | "subscription";
      successPath: string;
      cancelPath: string;
      type: string;
    }> = {
      messenger_ai: {
        packages: {
          "20":  { amount: 500,  credits: 20,  name: "20 Messenger AI Credits" },
          "50":  { amount: 1000, credits: 50,  name: "50 Messenger AI Credits" },
          "150": { amount: 2500, credits: 150, name: "150 Messenger AI Credits" },
        },
        mode: "payment",
        successPath: "/messenger?payment=success&credits={CREDITS}",
        cancelPath: "/messenger?payment=cancelled",
        type: "messenger_ai_credits",
      },
      coloring_pay_per_use: {
        packages: {
          "1": { amount: 200, credits: 1, name: "1 Coloring Page Credit" },
        },
        mode: "payment",
        successPath: "/coloring-pages?success=true&session_id={CHECKOUT_SESSION_ID}",
        cancelPath: "/coloring-pages?canceled=true",
        type: "coloring_pay_per_use",
      },
      anonymous_date: {
        packages: {
          basic:    { amount: 500,  credits: 10,  name: "Anonymous Date — Basic (10 credits)" },
          standard: { amount: 1200, credits: 30,  name: "Anonymous Date — Standard (30 credits)" },
          premium:  { amount: 2500, credits: 100, name: "Anonymous Date — Premium (100 credits)" },
          ultimate: { amount: 6000, credits: 300, name: "Anonymous Date — Ultimate (300 credits)" },
        },
        mode: "payment",
        successPath: "/anonymous-date?success=true&session_id={CHECKOUT_SESSION_ID}",
        cancelPath: "/anonymous-date?canceled=true",
        type: "anonymous_date_credits",
      },
      secret_santa: {
        packages: {
          "15":   { amount: 500,   credits: 15,   name: "Secret Santa 365 - 15 Credits" },
          "30":   { amount: 800,   credits: 30,   name: "Secret Santa 365 - 30 Credits" },
          "50":   { amount: 1200,  credits: 50,   name: "Secret Santa 365 - 50 Credits" },
          "100":  { amount: 2000,  credits: 100,  name: "Secret Santa 365 - 100 Credits" },
          "200":  { amount: 3500,  credits: 200,  name: "Secret Santa 365 - 200 Credits" },
          "350":  { amount: 5500,  credits: 350,  name: "Secret Santa 365 - 350 Credits" },
          "500":  { amount: 7500,  credits: 500,  name: "Secret Santa 365 - 500 Credits" },
          "750":  { amount: 10000, credits: 750,  name: "Secret Santa 365 - 750 Credits" },
          "1000": { amount: 13000, credits: 1000, name: "Secret Santa 365 - 1000 Credits" },
          "1500": { amount: 18000, credits: 1500, name: "Secret Santa 365 - 1500 Credits" },
        },
        mode: "payment",
        successPath: "/secret-santa?success=true&credits={CREDITS}",
        cancelPath: "/secret-santa?canceled=true",
        type: "secret_santa_credits",
      },
      emotion_insurance: {
        packages: {
          basic:    { amount: 999,  credits: 5,    name: "Emotion Insurance — Basic Protection" },
          standard: { amount: 1499, credits: 10,   name: "Emotion Insurance — Standard Protection" },
          premium:  { amount: 2499, credits: 9999, name: "Emotion Insurance — Premium Protection" },
        },
        mode: "subscription",
        successPath: "/emotion-economy?insurance=success&level={KEY}&session_id={CHECKOUT_SESSION_ID}",
        cancelPath: "/emotion-economy?insurance=canceled",
        type: "emotion_insurance",
      },
    };
    if (body.product && DYNAMIC_PACKS[String(body.product)]) {
      const def = DYNAMIC_PACKS[String(body.product)];
      const rawKey =
        body.packKey ?? body.credits ?? body.packageType ?? body.level ?? body.tier ?? "";
      const key = String(rawKey);
      const pkg = def.packages[key];
      if (!pkg) {
        return errorResponse(
          `Invalid package "${key}" for ${body.product}. Available: ${Object.keys(def.packages).join(", ")}`,
          400,
        );
      }
      const isSub = def.mode === "subscription";
      const successPath = def.successPath
        .replace("{CREDITS}", String(pkg.credits))
        .replace("{KEY}", key);
      const metadata: Record<string, string> = {
        user_id: userId ?? "",
        credits: String(pkg.credits),
        type: def.type,
        product: String(body.product),
        ...(isSub
          ? {
              coverage_level: key,
              max_claims: String(pkg.credits),
              monthly_price: String(pkg.amount / 100),
            }
          : { package_type: key }),
        ...stringifyMetadata(body.metadata || {}),
      };
      const sessionParams: Record<string, unknown> = {
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [{
          price_data: {
            currency: "eur",
            product_data: { name: pkg.name },
            unit_amount: pkg.amount,
            ...(isSub ? { recurring: { interval: "month" } } : {}),
          },
          quantity: 1,
        }],
        mode: def.mode,
        success_url: `${origin}${successPath}`,
        cancel_url: `${origin}${def.cancelPath}`,
        metadata,
      };
      if (isSub) {
        (sessionParams as any).subscription_data = {
          metadata: {
            product_type: def.type,
            coverage_level: key,
            user_id: userId ?? "",
          },
        };
      }
      const session = await stripe.checkout.sessions.create(sessionParams as any);
      return successResponse({ url: session.url, session_id: session.id });
    }

    // ─── B18f PHASE 3 — DB side-effect heavy checkouts merged into create-checkout ───
    // Bodies:
    //   fitslim:          { product: "fitslim", planType, profileData }
    //   horse_currency:   { product: "horse_currency", packageType }
    //   ar_preview:       { product: "ar_preview", productId }
    //   crystal_purchase: { product: "crystal_purchase", itemId, shippingAddress }
    //   auction_buyout:   { product: "auction_buyout", auction_id }
    const SIDE_EFFECT_PRODUCTS = new Set([
      "fitslim",
      "horse_currency",
      "ar_preview",
      "crystal_purchase",
      "auction_buyout",
    ]);
    if (body.product && SIDE_EFFECT_PRODUCTS.has(String(body.product))) {
      const admin = createSupabaseAdminClient();
      const uid = userId ?? "";

      // ── FITSLIM ──
      if (body.product === "fitslim") {
        const FITSLIM_PLANS: Record<string, string> = {
          weekly: "price_1T279R0QTWhd4oRpQKxVJFQe",
          monthly: "price_1T279R0QTWhd4oRpH4sC3gb9",
        };
        const planType = String(body.planType || "");
        const priceId = FITSLIM_PLANS[planType];
        if (!priceId) return errorResponse("Invalid fitslim planType", 400);
        const pd = body.profileData || {};
        const { data: planRecord, error: planError } = await admin
          .from("fitness_plans")
          .insert({
            user_id: uid,
            plan_type: planType,
            status: "pending",
            payment_status: "unpaid",
            age: pd.age,
            gender: pd.gender,
            height_cm: pd.height_cm,
            weight_kg: pd.weight_kg,
            target_weight_kg: pd.target_weight_kg,
            activity_level: pd.activity_level,
            fitness_goal: pd.fitness_goal,
            dietary_restrictions: pd.dietary_restrictions || [],
            health_conditions: pd.health_conditions || [],
          })
          .select()
          .single();
        if (planError) throw planError;
        const session = await stripe.checkout.sessions.create({
          customer: customerId || undefined,
          customer_email: customerId ? undefined : email,
          line_items: [{ price: priceId, quantity: 1 }],
          mode: "payment",
          success_url: `${origin}/fit-slim?success=true&plan_id=${planRecord.id}`,
          cancel_url: `${origin}/fit-slim?canceled=true`,
          metadata: {
            type: "fitslim_plan",
            plan_id: planRecord.id,
            plan_type: planType,
            user_id: uid,
            product: "fitslim",
          },
        });
        await admin.from("fitness_plans").update({ stripe_session_id: session.id }).eq("id", planRecord.id);
        return successResponse({ url: session.url, session_id: session.id, plan_id: planRecord.id });
      }

      // ── HORSE CURRENCY ──
      if (body.product === "horse_currency") {
        const HORSE_PACKS: Record<string, { coins: number; gems: number; price: number; name: string }> = {
          coins_100: { coins: 100, gems: 0, price: 1.99, name: "100 Horse Coins" },
          coins_500: { coins: 500, gems: 0, price: 8.99, name: "500 Horse Coins (Bonus)" },
          gems_50: { coins: 0, gems: 50, price: 4.99, name: "50 Horse Gems" },
          gems_200: { coins: 0, gems: 200, price: 18.99, name: "200 Horse Gems (Bonus)" },
        };
        const pkgKey = String(body.packageType || "");
        const pkg = HORSE_PACKS[pkgKey];
        if (!pkg) return errorResponse("Invalid horse_currency package", 400);
        const session = await stripe.checkout.sessions.create({
          customer: customerId || undefined,
          customer_email: customerId ? undefined : email,
          mode: "payment",
          line_items: [{
            quantity: 1,
            price_data: {
              currency: "eur",
              product_data: { name: pkg.name, description: "Horse Racing Arena currency" },
              unit_amount: Math.round(pkg.price * 100),
            },
          }],
          success_url: `${origin}/horse-racing?currency_purchased=true`,
          cancel_url: `${origin}/horse-racing?currency_canceled=true`,
          metadata: {
            user_id: uid,
            package_type: pkgKey,
            coins: String(pkg.coins),
            gems: String(pkg.gems),
            feature: "horse_racing_currency",
            type: "horse_currency",
            product: "horse_currency",
          },
        });
        await admin.from("horse_currency_purchases").insert({
          user_id: uid,
          package_type: pkgKey,
          coins_added: pkg.coins,
          gems_added: pkg.gems,
          amount_eur: pkg.price,
          stripe_session_id: session.id,
          status: "pending",
        });
        return successResponse({ url: session.url, session_id: session.id });
      }

      // ── AR PREVIEW ──
      if (body.product === "ar_preview") {
        const productId = String(body.productId || "");
        if (!productId) return errorResponse("productId required", 400);
        const session = await stripe.checkout.sessions.create({
          customer: customerId || undefined,
          customer_email: customerId ? undefined : email,
          mode: "payment",
          line_items: [{
            quantity: 1,
            price_data: {
              currency: "eur",
              product_data: { name: "AR Product Preview", description: "AR preview session" },
              unit_amount: 99,
            },
          }],
          success_url: `${origin}/home-decor?ar_success=true&product_id=${productId}`,
          cancel_url: `${origin}/home-decor?ar_canceled=true`,
          metadata: { user_id: uid, product_id: productId, type: "ar_preview", product: "ar_preview" },
        });
        await admin.from("ar_preview_sessions").insert({
          user_id: uid,
          product_id: productId,
          payment_status: "pending",
          amount: 0.99,
        });
        return successResponse({ url: session.url, session_id: session.id });
      }

      // ── CRYSTAL PURCHASE ──
      if (body.product === "crystal_purchase") {
        const itemId = String(body.itemId || "");
        if (!itemId) return errorResponse("itemId required", 400);
        const { data: item, error: itemError } = await admin
          .from("crystal_marketplace_items")
          .select("*")
          .eq("id", itemId)
          .single();
        if (itemError || !item) return errorResponse("Item not found", 404);
        if (!item.is_available) return errorResponse("Item no longer available", 400);
        const crystalFeePct = await getFeeRate("crystal");
        const platformCommission = Number((item.price * crystalFeePct / 100).toFixed(2));
        const sellerAmount = Number((item.price - platformCommission).toFixed(2));
        const { data: order, error: orderError } = await admin
          .from("crystal_marketplace_orders")
          .insert({
            item_id: itemId,
            buyer_id: uid,
            seller_id: item.seller_id,
            amount: item.price,
            platform_commission: platformCommission,
            seller_amount: sellerAmount,
            shipping_address: body.shippingAddress,
            status: "pending",
          })
          .select()
          .single();
        if (orderError) throw orderError;
        const session = await stripe.checkout.sessions.create({
          customer: customerId || undefined,
          customer_email: customerId ? undefined : email,
          mode: "payment",
          line_items: [{
            quantity: 1,
            price_data: {
              currency: "eur",
              product_data: {
                name: item.title,
                description: `${item.crystal_type} - ${item.weight_grams}g`,
                ...(item.image_url ? { images: [item.image_url] } : {}),
              },
              unit_amount: Math.round(Number(item.price) * 100),
            },
          }],
          success_url: `${origin}/crystal-marketplace?success=true&order_id=${order.id}`,
          cancel_url: `${origin}/crystal-marketplace?canceled=true`,
          metadata: {
            type: "crystal_purchase",
            product: "crystal_purchase",
            order_id: order.id,
            item_id: itemId,
            buyer_id: uid,
            user_id: uid,
          },
        });
        await admin
          .from("crystal_marketplace_orders")
          .update({ stripe_payment_id: session.id })
          .eq("id", order.id);
        return successResponse({ url: session.url, session_id: session.id });
      }

      // ── AUCTION BUYOUT (Stripe Connect destination charge, configurable commission) ──
      if (body.product === "auction_buyout") {
        const auctionId = String(body.auction_id || "");
        if (!auctionId) return errorResponse("auction_id required", 400);
        const { data: auction, error: aErr } = await admin
          .from("auction_items")
          .select("id, title, buyout_price, is_active, ends_at, user_id")
          .eq("id", auctionId)
          .maybeSingle();
        if (aErr) throw aErr;
        if (!auction) return errorResponse("auction not found", 404);
        if (!auction.is_active) return errorResponse("auction inactive", 400);
        if (new Date(auction.ends_at).getTime() <= Date.now()) return errorResponse("auction ended", 400);
        if (!auction.buyout_price) return errorResponse("no buyout price", 400);
        if (auction.user_id === uid) return errorResponse("cannot buy own auction", 400);

        // Resolve seller Stripe Connect account
        let sellerConnectId: string | null = null;
        const { data: sellerProfile } = await admin
          .from("profiles")
          .select("stripe_connect_account_id, stripe_connect_charges_enabled, stripe_connect_payouts_enabled")
          .eq("id", auction.user_id)
          .maybeSingle();
        if (
          sellerProfile?.stripe_connect_account_id &&
          sellerProfile?.stripe_connect_charges_enabled &&
          sellerProfile?.stripe_connect_payouts_enabled
        ) {
          sellerConnectId = sellerProfile.stripe_connect_account_id as string;
        }

        // Lookup commission rate (defaults to 10% if no row)
        let commissionRate = 10;
        const { data: setting } = await admin
          .from("platform_commission_settings")
          .select("commission_rate")
          .eq("service_type", "auction")
          .eq("is_active", true)
          .maybeSingle();
        if (setting?.commission_rate != null) commissionRate = Number(setting.commission_rate);

        const amount = Number(auction.buyout_price);
        const commissionAmount = +(amount * (commissionRate / 100)).toFixed(2);

        const sessionParams: Record<string, unknown> = {
          customer: customerId || undefined,
          customer_email: customerId ? undefined : email,
          mode: "payment",
          line_items: [{
            quantity: 1,
            price_data: {
              currency: "eur",
              unit_amount: Math.round(amount * 100),
              product_data: { name: `Auction buyout: ${auction.title}`.slice(0, 250) },
            },
          }],
          success_url: `${origin}/auction?payment=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/auction?payment=canceled`,
          metadata: {
            product_type: "auction_buyout",
            product: "auction_buyout",
            type: "auction_buyout",
            auction_id: auction.id,
            winner_id: uid,
            seller_id: auction.user_id,
            user_id: uid,
            commission_amount: String(commissionAmount),
            auto_split: sellerConnectId ? "true" : "false",
          },
        };
        if (sellerConnectId) {
          (sessionParams as any).payment_intent_data = {
            application_fee_amount: Math.round(commissionAmount * 100),
            transfer_data: { destination: sellerConnectId },
          };
        }
        const session = await stripe.checkout.sessions.create(sessionParams as any);
        return successResponse({ url: session.url, session_id: session.id, auto_split: !!sellerConnectId });
      }
    }


    // ─── B18b — 8 subscription/checkout functions merged into create-checkout ───
    // Fixed-price subscriptions + tier-map subscription + lottery passthrough
    // + rewards (battle_pass_premium / streak_freeze) + stream_access with DB side-effects.
    const B18B_FIXED_SUB: Record<
      string,
      { priceId: string; successPath: string; cancelPath: string; type: string; allowPromo?: boolean }
    > = {
      decor_pro_sub: {
        priceId: "price_1SVAKhGaXSfGtYFtK1yiOMde",
        successPath: "/home-decor?success=true",
        cancelPath: "/home-decor?canceled=true",
        type: "decor_pro_subscription",
      },
      phobia_subscription: {
        priceId: "price_1TG6WjGaXSfGtYFtV33gzF2d",
        successPath: "/phobia-trading?payment=success&session_id={CHECKOUT_SESSION_ID}&type=subscription",
        cancelPath: "/phobia-trading?payment=canceled",
        type: "phobia_subscription",
      },
      premium_all_modules: {
        priceId: "price_1TPJMBGaXSfGtYFtkhWbCu4V",
        successPath: "/premium?status=success&session_id={CHECKOUT_SESSION_ID}",
        cancelPath: "/premium?status=canceled",
        type: "premium_all_modules",
        allowPromo: true,
      },
      time_capsule_premium: {
        priceId: "price_1SQAPtGaXSfGtYFtuhuiyuUV",
        successPath: "/time-capsule?premium_success=true",
        cancelPath: "/time-capsule-subscription?canceled=true",
        type: "time_capsule_premium",
      },
    };
    if (body.product && B18B_FIXED_SUB[String(body.product)]) {
      const cfg = B18B_FIXED_SUB[String(body.product)];
      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [{ price: cfg.priceId, quantity: 1 }],
        mode: "subscription",
        success_url: `${origin}${cfg.successPath}`,
        cancel_url: `${origin}${cfg.cancelPath}`,
        allow_promotion_codes: cfg.allowPromo,
        metadata: {
          user_id: userId ?? "",
          type: cfg.type,
          product: String(body.product),
          ...stringifyMetadata(body.metadata || {}),
        },
      });
      return successResponse({ url: session.url, session_id: session.id });
    }

    // School subscription — 3 tiers
    if (body.product === "school_subscription") {
      const SCHOOL_TIERS: Record<string, string> = {
        kindergarten: "price_1SMprw0QTWhd4oRpQWjUkKA2",
        elementary:   "price_1SMpsK0QTWhd4oRp7oXQpFXh",
        premium:      "price_1SMpsg0QTWhd4oRpAIDNGOvv",
      };
      const tier = String(body.tier || "");
      const priceId = SCHOOL_TIERS[tier];
      if (!priceId) return errorResponse(`Invalid school tier: ${tier}. Valid: ${Object.keys(SCHOOL_TIERS).join(", ")}`, 400);
      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: `${origin}/schools?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/schools?canceled=true`,
        metadata: {
          user_id: userId ?? "",
          tier,
          type: "school_subscription",
          product: "school_subscription",
        },
      });
      return successResponse({ url: session.url, session_id: session.id });
    }

    // Lottery — flexible priceId passthrough (subscription by default, payment if isLifetime)
    if (body.product === "lottery_subscription" && body.priceId) {
      const isLifetime = body.isLifetime === true;
      const mode: "payment" | "subscription" = isLifetime ? "payment" : "subscription";
      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [{ price: String(body.priceId), quantity: 1 }],
        mode,
        success_url: `${origin}/lottery-ai?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/lottery-ai?canceled=true`,
        metadata: {
          user_id: userId ?? "",
          type: "lottery_subscription",
          product: "lottery_subscription",
          ...(body.tier ? { tier: String(body.tier) } : {}),
          is_lifetime: String(isLifetime),
        },
      });
      return successResponse({ url: session.url, session_id: session.id });
    }

    // Rewards checkout — battle_pass_premium (DB-driven price) or streak_freeze (static packs)
    if (body.product === "rewards_checkout") {
      const admin = createSupabaseAdminClient();
      const uid = userId ?? "";
      const kind = String(body.kind || "");
      const cancelPath = "/rewards?payment=canceled";
      const successPath = "/rewards?payment=success&session_id={CHECKOUT_SESSION_ID}";
      let line_items: Array<{ price_data: { currency: string; product_data: { name: string }; unit_amount: number }; quantity: number }> = [];
      const metadata: Record<string, string> = { user_id: uid, kind, type: "rewards_checkout", product: "rewards_checkout" };

      if (kind === "battle_pass_premium") {
        const { data: season, error: sErr } = await admin
          .from("battle_pass_seasons")
          .select("id, name, premium_price_eur, is_active")
          .eq("is_active", true)
          .order("starts_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (sErr || !season) return errorResponse("No active Battle Pass season", 400);
        const eur = Number(season.premium_price_eur || 0);
        if (eur <= 0) return errorResponse("Invalid premium price", 400);
        metadata.season_id = String(season.id);
        line_items = [{
          price_data: {
            currency: "eur",
            product_data: { name: `Battle Pass Premium · ${season.name}` },
            unit_amount: Math.round(eur * 100),
          },
          quantity: 1,
        }];
      } else if (kind === "streak_freeze") {
        const FREEZE_PACKS: Record<number, { eur: number; label: string }> = {
          1: { eur: 0.99, label: "Single Freeze" },
          3: { eur: 2.49, label: "Triple Pack" },
          7: { eur: 4.99, label: "Week Shield" },
        };
        const qty = Number(body.qty || 0);
        const pack = FREEZE_PACKS[qty];
        if (!pack) return errorResponse("Invalid streak freeze pack", 400);
        metadata.qty = String(qty);
        line_items = [{
          price_data: {
            currency: "eur",
            product_data: { name: `Streak Freeze · ${pack.label} (×${qty})` },
            unit_amount: Math.round(pack.eur * 100),
          },
          quantity: 1,
        }];
      } else {
        return errorResponse(`Unknown rewards kind: ${kind}`, 400);
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items,
        mode: "payment",
        success_url: `${origin}${successPath}`,
        cancel_url: `${origin}${cancelPath}`,
        metadata,
        payment_intent_data: { metadata },
      });
      return successResponse({ url: session.url, session_id: session.id });
    }

    // Stream access — DB-driven price + creator_live_stream_access pending insert
    if (body.product === "stream_access") {
      const admin = createSupabaseAdminClient();
      const uid = userId ?? "";
      const streamId = String(body.streamId || "");
      if (!streamId) return errorResponse("Missing streamId", 400);
      const { data: stream, error: streamError } = await admin
        .from("creator_live_streams")
        .select("*")
        .eq("id", streamId)
        .single();
      if (streamError || !stream) return errorResponse("Stream not found", 404);
      if (stream.is_free) return errorResponse("This stream is free", 400);
      const platformFee = Number(stream.access_price) * 0.1;
      const creatorPayout = Number(stream.access_price) - platformFee;
      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        mode: "payment",
        line_items: [{
          price_data: {
            currency: "eur",
            product_data: {
              name: `Live Stream Access: ${stream.title}`,
              description: stream.description || "Exclusive live stream access",
            },
            unit_amount: Math.round(Number(stream.access_price) * 100),
          },
          quantity: 1,
        }],
        success_url: `${origin}/creator/${stream.creator_id}?stream=success`,
        cancel_url: `${origin}/creator/${stream.creator_id}?stream=canceled`,
        metadata: {
          type: "stream_access",
          product: "stream_access",
          user_id: uid,
          stream_id: streamId,
          creator_id: stream.creator_id,
          platform_fee: platformFee.toString(),
          creator_payout: creatorPayout.toString(),
        },
      });
      await admin.from("creator_live_stream_access").insert({
        stream_id: streamId,
        user_id: uid,
        amount_paid: stream.access_price,
        platform_fee: platformFee,
        creator_payout: creatorPayout,
        stripe_session_id: session.id,
      });
      return successResponse({ url: session.url, session_id: session.id });
    }

    // ─── B18a — Megatalent (subscription, boost, tip, vip) ───
    if (body.product === "megatalent_subscription") {
      const PRICE_IDS: Record<string, string> = {
        premium: "price_1TOvuRGaXSfGtYFt6sfpt2Dy",
        top_premium: "price_1TOvuTGaXSfGtYFtIheCgIzQ",
      };
      const tier = String(body.tier || "");
      const priceId = PRICE_IDS[tier];
      if (!priceId) return errorResponse(`Invalid tier: ${tier}. Use 'premium' or 'top_premium'.`, 400);
      const referralCode = (body.referralCode ? String(body.referralCode).trim().toUpperCase() : "") || "";
      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: `${origin}/megatalent/success?session_id={CHECKOUT_SESSION_ID}&tier=${tier}`,
        cancel_url: `${origin}/megatalent?canceled=true`,
        metadata: {
          user_id: userId ?? "",
          tier,
          referral_code: referralCode,
          module: "megatalent",
          product: "megatalent_subscription",
        },
        subscription_data: {
          metadata: {
            user_id: userId ?? "",
            tier,
            referral_code: referralCode,
            module: "megatalent",
          },
        },
      });
      return successResponse({ url: session.url, session_id: session.id });
    }

    if (body.product === "megatalent_boost") {
      const admin = createSupabaseAdminClient();
      const submission_id = String(body.submission_id || "");
      const category = String(body.category || "");
      if (!submission_id || !category) return errorResponse("Missing submission_id/category", 400);
      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "eur",
            product_data: { name: "Megatalent Spotlight Boost (24h)" },
            unit_amount: 499,
          },
          quantity: 1,
        }],
        success_url: `${origin}/megatalent/${category}?boost=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/megatalent/${category}?boost=cancel`,
        metadata: {
          user_id: userId ?? "",
          submission_id,
          category,
          kind: "megatalent_boost",
          product: "megatalent_boost",
        },
      });
      await admin.from("megatalent_boosts").insert({
        user_id: userId,
        submission_id,
        category,
        amount_cents: 499,
        stripe_session_id: session.id,
        status: "pending",
      });
      return successResponse({ url: session.url, session_id: session.id });
    }

    if (body.product === "megatalent_tip") {
      const admin = createSupabaseAdminClient();
      const creatorId = String(body.creatorId || "");
      if (!creatorId) return errorResponse("creatorId required", 400);
      if (creatorId === userId) return errorResponse("Cannot tip yourself", 400);
      const amt = Number(body.amountCents);
      if (!Number.isFinite(amt) || amt < 100 || amt > 50000) {
        return errorResponse("amountCents must be 100..50000", 400);
      }
      const safeMessage = typeof body.message === "string" ? body.message.slice(0, 280) : null;
      const categorySlug = body.categorySlug ? String(body.categorySlug) : "";
      const platformFee = Math.round((amt * 2000) / 10000); // 20% platform fee
      const creatorAmount = amt - platformFee;
      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "eur",
            product_data: {
              name: "Megatalent Tip",
              description: safeMessage ?? `Support for talent ${creatorId.slice(0, 8)}`,
            },
            unit_amount: amt,
          },
          quantity: 1,
        }],
        success_url: `${origin}/megatalent?tip=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/megatalent?tip=cancel`,
        metadata: {
          type: "megatalent_tip",
          product: "megatalent_tip",
          creatorId,
          tipperId: userId ?? "",
          categorySlug,
        },
      });
      await admin.from("megatalent_tips").insert({
        creator_id: creatorId,
        tipper_id: userId,
        category_slug: categorySlug || null,
        amount_cents: amt,
        platform_fee_cents: platformFee,
        creator_amount_cents: creatorAmount,
        message: safeMessage,
        stripe_session_id: session.id,
        status: "pending",
      });
      return successResponse({ url: session.url, session_id: session.id });
    }

    if (body.product === "megatalent_vip") {
      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        mode: "subscription",
        line_items: [{
          price_data: {
            currency: "eur",
            recurring: { interval: "month" },
            product_data: {
              name: "Megatalent VIP Viewer Pass",
              description: "Ad-free viewing, early voting access, exclusive behind-the-scenes content, VIP badge.",
            },
            unit_amount: 499,
          },
          quantity: 1,
        }],
        success_url: `${origin}/megatalent?vip=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/megatalent?vip=cancel`,
        metadata: {
          user_id: userId ?? "",
          kind: "megatalent_vip_viewer",
          product: "megatalent_vip",
        },
      });
      return successResponse({ url: session.url, session_id: session.id });
    }

    // ─── B18c Events: concert_payment (song_request | collectible_ticket) ───
    if (body.product === "concert_payment") {
      const type = String(body.type || "");
      const amount = Number(body.amount);
      const metadata = (body.metadata && typeof body.metadata === "object") ? body.metadata : {};
      if (type !== "song_request" && type !== "collectible_ticket") {
        return errorResponse(`Unsupported concert type: ${type}`, 400);
      }
      if (!Number.isFinite(amount) || amount < 50) return errorResponse("Invalid amount", 400);
      const name = type === "song_request"
        ? `Song Request (${(metadata as any)?.tier || "standard"}) — ${(metadata as any)?.song || ""}`
        : `Collectible Ticket — ${(metadata as any)?.artist || ""} ${(metadata as any)?.edition || ""} Edition`;
      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        mode: "payment",
        line_items: [{
          price_data: {
            currency: "eur",
            product_data: { name },
            unit_amount: amount,
          },
          quantity: 1,
        }],
        success_url: `${origin}/live-concerts?purchase=success&type=${type}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/live-concerts?purchase=canceled`,
        metadata: {
          user_id: userId ?? "",
          type,
          product: "concert_payment",
          ...(Object.fromEntries(Object.entries(metadata).map(([k, v]) => [k, String(v)]))),
        },
      });
      return successResponse({ url: session.url, session_id: session.id });
    }

    // ─── B18c Events: concert_ticket (live concert ticket purchase, 80/20 split) ───
    if (body.product === "concert_ticket") {
      const admin = createSupabaseAdminClient();
      const concertId = String(body.concertId || "");
      const ticketTypeId = String(body.ticketTypeId || "");
      if (!concertId || !ticketTypeId) return errorResponse("Missing concertId/ticketTypeId", 400);

      const { data: ticketType, error: ticketError } = await admin
        .from("concert_ticket_types")
        .select("*, live_concert_streams(title, musician_id)")
        .eq("id", ticketTypeId)
        .single();
      if (ticketError || !ticketType) return errorResponse("Ticket type not found", 400);

      const { data: musician } = await admin
        .from("musician_profiles")
        .select("stage_name")
        .eq("id", (ticketType as any).live_concert_streams.musician_id)
        .single();

      const { data: existing } = await admin
        .from("concert_ticket_purchases")
        .select("id")
        .eq("user_id", userId)
        .eq("concert_id", concertId)
        .eq("payment_status", "completed")
        .maybeSingle();
      if (existing) return errorResponse("You already have a ticket for this concert", 400);

      const priceEur = Number((ticketType as any).price);
      const unit = Math.round(priceEur * 100);
      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        mode: "payment",
        line_items: [{
          price_data: {
            currency: "eur",
            product_data: {
              name: `${String((ticketType as any).name).toUpperCase()} Ticket - ${(ticketType as any).live_concert_streams.title}`,
              description: `Live concert by ${musician?.stage_name || "Artist"}`,
            },
            unit_amount: unit,
          },
          quantity: 1,
        }],
        success_url: `${origin}/live-concerts?success=true&type=ticket&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/live-concerts?canceled=true`,
        metadata: {
          user_id: userId ?? "",
          concert_id: concertId,
          ticket_type_id: ticketTypeId,
          musician_id: (ticketType as any).live_concert_streams.musician_id,
          type: "concert_ticket",
          product: "concert_ticket",
        },
      });

      const concertFeePct = await getFeeRate("megatalent");
      const concertFeeRate = concertFeePct / 100;
      await admin.from("concert_ticket_purchases").insert({
        user_id: userId,
        concert_id: concertId,
        ticket_type_id: ticketTypeId,
        amount: priceEur,
        musician_amount: Number((priceEur * (1 - concertFeeRate)).toFixed(2)),
        platform_commission: Number((priceEur * concertFeeRate).toFixed(2)),
        commission_rate: concertFeeRate,
        payment_status: "pending",
        stripe_session_id: session.id,
      });

      return successResponse({ url: session.url, session_id: session.id });
    }

    // ─── B18c Events: comedy_coins (fixed 100 coins for €5) ───
    if (body.product === "comedy_coins") {
      const coins = Number(body.coins || 100);
      const priceId = "price_1SVehXGaXSfGtYFtgUbBfnFe";
      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "payment",
        success_url: `${origin}/comedy-club?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/comedy-club?payment=canceled`,
        metadata: {
          user_id: userId ?? "",
          type: "comedy_coins",
          product: "comedy_coins",
          coins: String(coins),
        },
      });
      return successResponse({ url: session.url, session_id: session.id });
    }

    // ─── B18c Events: kitchen_battle_create (no Stripe — DB insert only) ───
    if (body.product === "kitchen_battle_create") {
      const admin = createSupabaseAdminClient();
      const THEMES = [
        "Street Food Showdown", "Fine Dining Fusion", "Mystery Box Madness",
        "Dessert Wars", "One-Pan Wonders", "Spice It Up", "Plant-Based Battle",
        "Comfort Food Classics", "Breakfast Reinvented", "Midnight Snack Duel",
      ];
      const theme = String(body.theme || THEMES[Math.floor(Math.random() * THEMES.length)]);
      const description = String(body.description || `Compete with your best dish around: ${theme}`);
      const { data, error } = await admin.from("kitchen_battles").insert({
        theme, description, created_by: userId,
      }).select().single();
      if (error) return errorResponse(error.message, 400);
      return successResponse({ battle: data });
    }

    // ─── B18d Creator Economy: paid_message (10% platform fee) ───
    if (body.product === "paid_message") {
      const creatorId = String(body.creatorId || "");
      const message = String(body.message || "");
      if (!creatorId || !message) return errorResponse("Missing creatorId or message", 400);
      const admin = createSupabaseAdminClient();
      const { data: settings } = await admin
        .from("creator_message_settings")
        .select("price_per_message")
        .eq("creator_id", creatorId)
        .maybeSingle();
      const pricePerMessage = Number(settings?.price_per_message ?? 5);
      const platformFee = Number((pricePerMessage * 0.1).toFixed(2));
      const creatorPayout = Number((pricePerMessage - platformFee).toFixed(2));
      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [{
          price_data: {
            currency: "eur",
            product_data: {
              name: "Paid Message to Creator",
              description: `Direct message to the creator (${message.substring(0, 50)}...)`,
            },
            unit_amount: Math.round(pricePerMessage * 100),
          },
          quantity: 1,
        }],
        mode: "payment",
        success_url: `${origin}/creator/${creatorId}?message=success`,
        cancel_url: `${origin}/creator/${creatorId}?message=canceled`,
        metadata: {
          type: "paid_message",
          product: "paid_message",
          sender_id: userId ?? "",
          creator_id: creatorId,
          message: message.substring(0, 500),
          platform_fee: String(platformFee),
          creator_payout: String(creatorPayout),
        },
      });
      await admin.from("creator_paid_messages").insert({
        sender_id: userId,
        creator_id: creatorId,
        content: message,
        amount_paid: pricePerMessage,
        platform_fee: platformFee,
        creator_payout: creatorPayout,
        stripe_session_id: session.id,
        status: "pending",
      });
      return successResponse({ url: session.url });
    }

    // ─── B18d Creator Economy: profile_tip (10% fee, Stripe Connect destination charges when available) ───
    if (body.product === "profile_tip") {
      const recipientId = String(body.recipientId || "");
      const amt = Number(body.amountCents);
      if (!recipientId) return errorResponse("recipientId required", 400);
      if (recipientId === userId) return errorResponse("Cannot tip yourself", 400);
      if (!Number.isFinite(amt) || amt < 100 || amt > 10_000) {
        return errorResponse("Amount must be between €1 and €100", 400);
      }
      const safeMessage = typeof body.message === "string" ? body.message.slice(0, 280) : null;
      const platformFee = Math.round((amt * 1000) / 10000);
      const admin = createSupabaseAdminClient();
      const { data: recipient } = await admin
        .from("profiles")
        .select("id, full_name, username, stripe_connect_account_id, stripe_connect_charges_enabled")
        .eq("id", recipientId)
        .maybeSingle();
      if (!recipient) return errorResponse("Recipient not found", 404);
      const useConnect = !!(recipient.stripe_connect_account_id && recipient.stripe_connect_charges_enabled);
      const sessionParams: Record<string, unknown> = {
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "eur",
            product_data: {
              name: `Tip for ${recipient.full_name ?? recipient.username ?? "creator"}`,
              description: safeMessage ?? "Profile tip",
            },
            unit_amount: amt,
          },
          quantity: 1,
        }],
        success_url: `${origin}/profile/${recipientId}?tip=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/profile/${recipientId}?tip=cancel`,
        metadata: {
          type: "profile_tip",
          product: "profile_tip",
          recipientId,
          senderId: userId ?? "",
        },
      };
      if (customerId) sessionParams.customer = customerId;
      else if (email) sessionParams.customer_email = email;
      if (useConnect) {
        sessionParams.payment_intent_data = {
          application_fee_amount: platformFee,
          transfer_data: { destination: recipient.stripe_connect_account_id! },
          description: `Tip from ${email ?? userId} → ${recipientId}`,
        };
      }
      const session = await stripe.checkout.sessions.create(sessionParams as any);
      const { error: insertErr } = await admin.from("profile_tips").insert({
        sender_id: userId,
        recipient_id: recipientId,
        amount_cents: amt,
        platform_fee_cents: platformFee,
        recipient_amount_cents: amt - platformFee,
        message: safeMessage,
        stripe_session_id: session.id,
        destination_account_id: useConnect ? recipient.stripe_connect_account_id : null,
        status: "pending",
        currency: "eur",
      });
      if (insertErr) log.error("profile_tip insert error", insertErr);
      return successResponse({ url: session.url, sessionId: session.id, connectEnabled: useConnect });
    }

    // ─── B18d Creator Economy: merch_purchase (10% platform fee, optional shipping for physical) ───
    if (body.product === "merch_purchase") {
      const merchId = String(body.merchId || "");
      const quantity = Math.max(1, Number(body.quantity || 1));
      if (!merchId) return errorResponse("Missing merchId", 400);
      const admin = createSupabaseAdminClient();
      const { data: merch, error: merchError } = await admin
        .from("creator_merch")
        .select("*")
        .eq("id", merchId)
        .eq("is_active", true)
        .single();
      if (merchError || !merch) return errorResponse("Merch item not found", 404);
      if (merch.stock_quantity !== null && merch.stock_quantity < quantity) {
        return errorResponse("Insufficient stock", 400);
      }
      const totalAmount = Number((merch.price * quantity).toFixed(2));
      const platformFee = Number((totalAmount * 0.1).toFixed(2));
      const creatorPayout = Number((totalAmount - platformFee).toFixed(2));
      const sessionConfig: Record<string, unknown> = {
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [{
          price_data: {
            currency: "eur",
            product_data: {
              name: merch.name,
              description: merch.description || undefined,
              images: merch.image_url ? [merch.image_url] : undefined,
            },
            unit_amount: Math.round(merch.price * 100),
          },
          quantity,
        }],
        mode: "payment",
        success_url: `${origin}/creator/${merch.creator_id}?merch=success`,
        cancel_url: `${origin}/creator/${merch.creator_id}?merch=canceled`,
        metadata: {
          type: "merch_purchase",
          product: "merch_purchase",
          buyer_id: userId ?? "",
          merch_id: merchId,
          creator_id: merch.creator_id,
          quantity: String(quantity),
          platform_fee: String(platformFee),
          creator_payout: String(creatorPayout),
        },
      };
      if (!merch.is_digital) {
        sessionConfig.shipping_address_collection = {
          allowed_countries: ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE"],
        };
      }
      const session = await stripe.checkout.sessions.create(sessionConfig as any);
      await admin.from("creator_merch_orders").insert({
        buyer_id: userId,
        creator_id: merch.creator_id,
        merch_id: merchId,
        quantity,
        amount: totalAmount,
        platform_fee: platformFee,
        creator_payout: creatorPayout,
        stripe_session_id: session.id,
        status: "pending",
      });
      return successResponse({ url: session.url });
    }

    // ─── B18d Creator Economy: service_order (15% commission, pre-creates order with delivery deadline) ───
    if (body.product === "service_order") {
      const offeringId = String(body.offeringId || "");
      const requirements = String(body.requirements || "");
      const deliveryDays = Number(body.deliveryDays || 0);
      const totalAmount = Number(body.totalAmount || 0);
      if (!offeringId || !requirements || !deliveryDays || !totalAmount) {
        return errorResponse("Missing offeringId, requirements, deliveryDays or totalAmount", 400);
      }
      const COMMISSION_RATE = 0.15;
      const admin = createSupabaseAdminClient();
      const { data: offering, error: offeringError } = await admin
        .from("skill_offerings")
        .select("*")
        .eq("id", offeringId)
        .single();
      if (offeringError || !offering) return errorResponse("Offering not found", 404);
      const commissionAmount = Number((totalAmount * COMMISSION_RATE).toFixed(2));
      const sellerPayout = Number((totalAmount - commissionAmount).toFixed(2));
      const deliveryDeadline = new Date();
      deliveryDeadline.setDate(deliveryDeadline.getDate() + deliveryDays);
      const { data: order, error: orderError } = await admin
        .from("service_orders")
        .insert({
          offering_id: offeringId,
          buyer_id: userId,
          seller_id: offering.user_id,
          requirements,
          total_amount: totalAmount,
          commission_rate: COMMISSION_RATE,
          commission_amount: commissionAmount,
          seller_payout: sellerPayout,
          delivery_deadline: deliveryDeadline.toISOString(),
          status: "pending",
        })
        .select()
        .single();
      if (orderError || !order) {
        log.error("service_order insert error", orderError);
        return errorResponse("Failed to create order", 500);
      }
      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [{
          price_data: {
            currency: "eur",
            product_data: {
              name: offering.title,
              description: `Service order: ${requirements.substring(0, 100)}...`,
            },
            unit_amount: Math.round(totalAmount * 100),
          },
          quantity: 1,
        }],
        mode: "payment",
        success_url: `${origin}/marketplace?order_success=${order.id}`,
        cancel_url: `${origin}/marketplace?order_cancelled=${order.id}`,
        metadata: {
          type: "service_order",
          product: "service_order",
          order_id: order.id,
          seller_id: offering.user_id,
          commission_amount: String(commissionAmount),
          seller_payout: String(sellerPayout),
        },
      });
      await admin.from("service_orders").update({ stripe_session_id: session.id }).eq("id", order.id);
      return successResponse({ url: session.url, orderId: order.id });
    }


    // ─── B18e — Brand campaign escrow (legacy: brand-campaign-checkout) ───
    if (body.product === "brand_campaign_escrow") {
      if (!userId || !email) return errorResponse("Login required", 401);
      const applicationId = String(body.applicationId || "");
      const agreedEur = Number(body.agreedEur);
      if (!applicationId || !Number.isFinite(agreedEur) || agreedEur < 1 || agreedEur > 100000) {
        return errorResponse("applicationId and agreedEur (1–100000) required", 400);
      }
      const PLATFORM_FEE_PCT = 0.20;
      const admin = createSupabaseAdminClient();
      const { data: app, error: appErr } = await admin
        .from("campaign_applications")
        .select(`
          id, status, payment_status, user_id, campaign_id,
          brand_campaigns ( id, user_id, brand_name, campaign_name ),
          virtual_influencers!inner ( id, user_id, name )
        `)
        .eq("id", applicationId)
        .maybeSingle();
      if (appErr || !app) return errorResponse("Application not found", 404);
      const campaign = (app as any).brand_campaigns;
      const influencer = (app as any).virtual_influencers;
      if (!campaign || !influencer) return errorResponse("Campaign or influencer missing", 404);
      if (campaign.user_id !== userId) return errorResponse("Only the campaign owner can pay", 403);
      if (app.payment_status === "paid" || app.payment_status === "released") {
        return errorResponse("This application is already paid", 409);
      }
      const amountCents = Math.round(agreedEur * 100);
      const platformFeeCents = Math.round(amountCents * PLATFORM_FEE_PCT);
      const netCents = amountCents - platformFeeCents;
      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        mode: "payment",
        line_items: [{
          price_data: {
            currency: "eur",
            product_data: {
              name: `Brand campaign: ${campaign.campaign_name}`,
              description: `Escrow for influencer ${influencer.name}. Released after work is marked completed.`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        }],
        payment_intent_data: {
          description: `Brand Campaign Escrow — ${campaign.campaign_name}`,
          metadata: {
            type: "brand_campaign_escrow",
            application_id: applicationId,
            campaign_id: campaign.id,
            brand_user_id: userId,
            influencer_id: influencer.id,
            influencer_user_id: influencer.user_id,
            platform_fee_cents: String(platformFeeCents),
            net_cents: String(netCents),
          },
        },
        metadata: {
          type: "brand_campaign_escrow",
          product: "brand_campaign_escrow",
          application_id: applicationId,
        },
        success_url: `${origin}/brand-collaboration?escrow=success&app=${applicationId}`,
        cancel_url: `${origin}/brand-collaboration?escrow=cancelled&app=${applicationId}`,
      });
      const { error: escrowErr } = await admin
        .from("campaign_escrow")
        .insert({
          application_id: applicationId,
          campaign_id: campaign.id,
          brand_user_id: userId,
          influencer_id: influencer.id,
          influencer_user_id: influencer.user_id,
          amount_cents: amountCents,
          platform_fee_cents: platformFeeCents,
          net_cents: netCents,
          currency: "eur",
          status: "awaiting_payment",
          stripe_session_id: session.id,
        });
      if (escrowErr) log.error("Failed to insert escrow row", escrowErr);
      await admin
        .from("campaign_applications")
        .update({
          status: "approved",
          approved_by: userId,
          approved_at: new Date().toISOString(),
          agreed_amount: agreedEur,
          payment_status: "pending",
        })
        .eq("id", applicationId);
      return successResponse({ url: session.url, sessionId: session.id });
    }

    // ─── B18e — Brand sponsorship subscription (legacy: create-brand-sponsorship) ───
    if (body.product === "brand_sponsorship") {
      if (!userId || !email) return errorResponse("Login required", 401);
      const TIER_PRICES: Record<string, string> = {
        bronze: "price_1SSD7e0QTWhd4oRpbo9399Fq",
        silver: "price_1SSD8C0QTWhd4oRpvFe7cP4z",
        gold: "price_1SSD8O0QTWhd4oRpihR2CucC",
        platinum: "price_1SSD8O0QTWhd4oRpD269KcUs",
        enterprise: "price_1TfxBOGaXSfGtYFtgWu0U3QY",
      };
      const tier = String(body.tier || "");
      if (!tier || !TIER_PRICES[tier]) return errorResponse("Invalid tier", 400);
      const admin = createSupabaseAdminClient();
      const { data: existingSponsor } = await admin
        .from("brand_sponsors")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();
      if (!existingSponsor && body.brandData) {
        await admin.from("brand_sponsors").insert({
          user_id: userId,
          name: body.brandData.name,
          logo: body.brandData.logo,
          tier,
          category: body.brandData.category,
          description: body.brandData.description,
          website: body.brandData.website,
          subscription_status: "pending",
        });
      }
      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [{ price: TIER_PRICES[tier], quantity: 1 }],
        mode: "subscription",
        success_url: `${origin}/brand-battle?success=true`,
        cancel_url: `${origin}/brand-battle?canceled=true`,
        metadata: {
          user_id: userId,
          type: "brand_sponsorship",
          product: "brand_sponsorship",
          tier,
        },
      });
      return successResponse({ url: session.url });
    }

    // ─── B18e — Brand votes payment (legacy: create-brand-votes-payment) ───
    if (body.product === "brand_votes") {
      if (!userId || !email) return errorResponse("Login required", 401);
      const priceId = String(body.priceId || "");
      if (!priceId) return errorResponse("priceId is required", 400);
      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "payment",
        success_url: `${origin}/brand-battle?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/brand-battle?payment=canceled`,
        metadata: {
          user_id: userId,
          type: "brand_votes",
          product: "brand_votes",
          price_id: priceId,
        },
      });
      return successResponse({ url: session.url });
    }

    // ─── B18e — Campaign payment checkout (legacy: create-campaign-payment-checkout) ───
    if (body.product === "campaign_payment") {
      if (!userId || !email) return errorResponse("Login required", 401);
      const applicationId = String(body.applicationId || "");
      const amount = Number(body.amount);
      if (!applicationId || !Number.isFinite(amount) || amount <= 0) {
        return errorResponse("applicationId and positive amount required", 400);
      }
      const admin = createSupabaseAdminClient();
      const { data: application, error: appError } = await admin
        .from("campaign_applications")
        .select(`*, brand_campaigns ( id, user_id, brand_name, campaign_name, budget_min, budget_max )`)
        .eq("id", applicationId)
        .eq("status", "approved")
        .single();
      if (appError || !application) return errorResponse("Application not found or not approved", 404);
      const campaign = (application as any).brand_campaigns;
      if (!campaign || campaign.user_id !== userId) {
        return errorResponse("Only campaign owner can make payment", 403);
      }
      if (amount < campaign.budget_min || amount > campaign.budget_max) {
        return errorResponse(`Amount must be between ${campaign.budget_min} and ${campaign.budget_max}`, 400);
      }
      const { data: influencer } = await admin
        .from("virtual_influencers")
        .select("id, name, user_id")
        .eq("user_id", application.user_id)
        .maybeSingle();
      const influencerName = influencer?.name || "the influencer";
      const platformFee = Math.round(amount * 0.20 * 100) / 100;
      const influencerAmount = Math.round(amount * 0.80 * 100) / 100;
      const { data: payment, error: paymentError } = await admin
        .from("campaign_payments")
        .insert({
          campaign_id: campaign.id,
          application_id: applicationId,
          brand_user_id: userId,
          influencer_user_id: application.user_id,
          amount,
          platform_fee: platformFee,
          influencer_amount: influencerAmount,
          status: "pending",
        })
        .select()
        .single();
      if (paymentError || !payment) {
        log.error("campaign_payment insert error", paymentError);
        return errorResponse("Failed to create payment record", 500);
      }
      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [{
          price_data: {
            currency: "eur",
            product_data: {
              name: `Campaign: ${campaign.campaign_name}`,
              description: `Payment to ${influencerName} for brand collaboration`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        }],
        mode: "payment",
        success_url: `${origin}/brand-collaboration?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/brand-collaboration?payment=canceled`,
        metadata: {
          type: "campaign_payment",
          product: "campaign_payment",
          payment_id: payment.id,
          application_id: applicationId,
          campaign_id: campaign.id,
        },
      });
      await admin
        .from("campaign_payments")
        .update({ stripe_session_id: session.id })
        .eq("id", payment.id);
      return successResponse({ url: session.url, paymentId: payment.id });
    }


    // ─── B18f — Bazaar order (Stripe Connect auto-split, configurable commission) ───
    if (body.product === "bazaar_order") {
      if (!userId || !email) return errorResponse("Login required", 401);
      const itemId: string | undefined = (body as any).itemId || (body as any).item_id;
      const shippingAddress: string | undefined = (body as any).shippingAddress || (body as any).shipping_address;
      const buyerNotes: string | null = (body as any).buyerNotes || (body as any).buyer_notes || null;
      if (!itemId) return errorResponse("Missing itemId", 400);
      if (!shippingAddress || !String(shippingAddress).trim()) return errorResponse("Missing shipping address", 400);

      const admin = createSupabaseAdminClient();
      const { data: item, error: itemErr } = await admin
        .from("bazaar_items")
        .select("id, user_id, title, price, is_sold, is_active")
        .eq("id", itemId)
        .maybeSingle();
      if (itemErr || !item) return errorResponse("Item not found", 404);
      if (item.is_sold) return errorResponse("Item already sold", 400);
      if (!item.is_active) return errorResponse("Item not available", 400);
      if (item.user_id === userId) return errorResponse("You cannot buy your own item", 400);

      let sellerConnectId: string | null = null;
      const { data: sellerProfile } = await admin
        .from("profiles")
        .select("stripe_connect_account_id, stripe_connect_charges_enabled, stripe_connect_payouts_enabled")
        .eq("id", item.user_id)
        .maybeSingle();
      if (
        sellerProfile?.stripe_connect_account_id &&
        sellerProfile?.stripe_connect_charges_enabled &&
        sellerProfile?.stripe_connect_payouts_enabled
      ) {
        sellerConnectId = sellerProfile.stripe_connect_account_id as string;
      }

      let commissionRate = 10;
      const { data: setting } = await admin
        .from("platform_commission_settings")
        .select("commission_rate")
        .eq("service_type", "bazaar")
        .eq("is_active", true)
        .maybeSingle();
      if (setting?.commission_rate != null) commissionRate = Number(setting.commission_rate);

      const amount = Number(item.price);
      const commissionAmount = +(amount * (commissionRate / 100)).toFixed(2);
      const sellerPayout = +(amount - commissionAmount).toFixed(2);

      const { data: order, error: orderErr } = await admin
        .from("bazaar_orders")
        .insert({
          item_id: item.id,
          buyer_id: userId,
          seller_id: item.user_id,
          amount,
          commission_amount: commissionAmount,
          seller_payout: sellerPayout,
          status: "pending",
          shipping_address: String(shippingAddress).trim(),
          buyer_notes: buyerNotes,
        })
        .select()
        .single();
      if (orderErr || !order) {
        log.error("bazaar_order insert error", orderErr);
        return errorResponse("Failed to create order", 500);
      }

      const sessionParams: Record<string, unknown> = {
        customer_email: email,
        line_items: [{
          price_data: {
            currency: "eur",
            unit_amount: Math.round(amount * 100),
            product_data: {
              name: `Bazaar: ${item.title}`.slice(0, 250),
              description: `Order ${order.id.slice(0, 8)}`,
            },
          },
          quantity: 1,
        }],
        mode: "payment",
        success_url: `${origin}/bazaar?payment=success&session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
        cancel_url: `${origin}/bazaar?payment=cancelled&order_id=${order.id}`,
        metadata: {
          type: "bazaar_order",
          product: "bazaar_order",
          order_id: order.id,
          item_id: item.id,
          buyer_id: userId,
          seller_id: item.user_id,
          auto_split: sellerConnectId ? "true" : "false",
        },
      };
      if (sellerConnectId) {
        (sessionParams as any).payment_intent_data = {
          application_fee_amount: Math.round(commissionAmount * 100),
          transfer_data: { destination: sellerConnectId },
        };
      }
      const session = await stripe.checkout.sessions.create(sessionParams as any);
      await admin.from("bazaar_orders").update({ stripe_session_id: session.id }).eq("id", order.id);
      return successResponse({ url: session.url, session_id: session.id, order_id: order.id, auto_split: !!sellerConnectId });
    }

    // ─── B18f — Shadow Patron subscription (bronze/silver/gold) ───
    if (body.product === "shadow_patron") {
      if (!userId || !email) return errorResponse("Login required", 401);
      const TIERS: Record<string, { amount: number; label: string }> = {
        bronze: { amount: 499, label: "Bronze Patron — €4.99/mo" },
        silver: { amount: 999, label: "Silver Patron — €9.99/mo" },
        gold: { amount: 1999, label: "Gold Patron — €19.99/mo" },
      };
      const tier = String((body as any).tier || "");
      const authorUserId = String((body as any).authorUserId || "");
      if (!authorUserId || !TIERS[tier]) return errorResponse("Invalid tier or authorUserId", 400);
      const t = TIERS[tier];
      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        mode: "subscription",
        line_items: [{
          price_data: {
            currency: "eur",
            recurring: { interval: "month" },
            product_data: { name: `Patron — ${tier.toUpperCase()}` },
            unit_amount: t.amount,
          },
          quantity: 1,
        }],
        metadata: {
          type: "shadow_patron",
          product: "shadow_patron",
          patron_user_id: userId,
          author_user_id: authorUserId,
          tier,
        },
        success_url: `${origin}/shadow-arena/dashboard?patron=success`,
        cancel_url: `${origin}/shadow-arena/dashboard?patron=cancel`,
      });
      return successResponse({ url: session.url });
    }

    // ─── B18f — Shadow gift (pre-insert pending shadow_gifts row) ───
    if (body.product === "shadow_gift") {
      if (!userId || !email) return errorResponse("Login required", 401);
      const GIFT_PRICES: Record<string, number> = {
        rose: 199, candle: 299, skull: 499, raven: 999, pact: 1999,
      };
      const battleId = String((body as any).battleId || "");
      const participantId = String((body as any).participantId || "");
      const giftType = String((body as any).giftType || "");
      if (!battleId || !participantId || !giftType) {
        return errorResponse("battleId, participantId, giftType required", 400);
      }
      const amount = GIFT_PRICES[giftType] ?? 299;
      const admin = createSupabaseAdminClient();
      const { data: gift, error: gErr } = await admin
        .from("shadow_gifts")
        .insert({
          battle_id: battleId,
          participant_id: participantId,
          sender_id: userId,
          gift_type: giftType,
          gift_amount: amount,
          status: "pending",
        })
        .select()
        .single();
      if (gErr || !gift) {
        log.error("shadow_gift insert error", gErr);
        return errorResponse("Failed to create gift", 500);
      }
      const session = await stripe.checkout.sessions.create({
        customer_email: email,
        line_items: [{
          price_data: {
            currency: "eur",
            unit_amount: amount,
            product_data: { name: `Shadow Arena gift: ${giftType}` },
          },
          quantity: 1,
        }],
        mode: "payment",
        success_url: `${origin}/shadow-arena/battle/${battleId}?gift=success`,
        cancel_url: `${origin}/shadow-arena/battle/${battleId}?gift=canceled`,
        metadata: {
          type: "shadow_gift",
          product: "shadow_gift",
          user_id: userId,
          gift_id: gift.id,
          battle_id: battleId,
          participant_id: participantId,
        },
      });
      await admin.from("shadow_gifts").update({ stripe_payment_id: session.id }).eq("id", gift.id);
      return successResponse({ url: session.url, session_id: session.id });
    }


    if (body.product && !body.priceId && !body.productKey && !body.credits) {
      // Free actions (e.g. create-character, create-universe) just return ok
      if (body.free === true) {
        return successResponse({
          ok: true,
          free: true,
          product: body.product,
          message: "No payment required for this action.",
        });
      }

      const productKey = String(body.product);
      // Default per-product pricing in EUR cents (used when frontend doesn't pass amount)
      const PRODUCT_DEFAULTS: Record<string, { amount: number; mode: "payment" | "subscription"; name: string }> = {
        analyzer_credits:        { amount: 999,  mode: "payment",      name: "Analyzer Credits" },
        analyzer_subscription:   { amount: 1499, mode: "subscription", name: "Analyzer Subscription" },
        ar_preview:              { amount: 299,  mode: "payment",      name: "AR Preview Session" },
        astrology:               { amount: 999,  mode: "subscription", name: "Astrology Premium" },
        bazaar_order:            { amount: 1999, mode: "payment",      name: "Bazaar Order" },
        best_friend:             { amount: 999,  mode: "subscription", name: "Best Friend Premium" },
        brain_duel:              { amount: 199,  mode: "payment",      name: "Brain Duel Entry" },
        campaign_donation:       { amount: 500,  mode: "payment",      name: "Campaign Donation" },
        character_credits:       { amount: 999,  mode: "payment",      name: "Character Credits" },
        companions:              { amount: 1499, mode: "subscription", name: "Companions Premium" },
        confession:              { amount: 299,  mode: "payment",      name: "Confession Boost" },
        consultation:            { amount: 4999, mode: "payment",      name: "Consultation" },
        coupon:                  { amount: 199,  mode: "payment",      name: "Coupon Purchase" },
        crystal:                 { amount: 1000, mode: "subscription", name: "Crystal & Energy Premium" },
        creator_subscription:    { amount: 1999, mode: "subscription", name: "Creator Subscription" },
        credits:                 { amount: 999,  mode: "payment",      name: "Credits" },
        decor:                   { amount: 1499, mode: "subscription", name: "Decor Premium" },
        dna_memory:              { amount: 1999, mode: "payment",      name: "DNA Memory" },
        dna_analysis:            { amount: 9900, mode: "payment",      name: "DNA Analysis (Complete Sequencing)" },
        dna_ancestral_memories:  { amount: 1200, mode: "subscription", name: "Ancestral Memories Subscription" },
        dna_genetic_dating:      { amount: 1500, mode: "subscription", name: "Genetic Dating Subscription" },
        dna_digital_offspring:   { amount: 14900, mode: "payment",     name: "Digital Offspring (Lifetime)" },
        emotion_credits:         { amount: 999,  mode: "payment",      name: "Emotion Credits" },
        emotion_market:          { amount: 499,  mode: "payment",      name: "Emotion Market" },
        employer_subscription:   { amount: 4999, mode: "subscription", name: "Employer Subscription" },
        escape_room:             { amount: 999,  mode: "payment",      name: "Escape Room Access" },
        f1:                      { amount: 1999, mode: "subscription", name: "F1 Premium" },
        fashion_marketplace:     { amount: 999,  mode: "payment",      name: "Fashion Marketplace" },
        future_face:             { amount: 999,  mode: "subscription", name: "Future Face Premium" },
        healthcare_subscription: { amount: 1999, mode: "subscription", name: "Healthcare Subscription" },
        job_listing:             { amount: 4999, mode: "payment",      name: "Job Listing" },
        kids_reading:            { amount: 999,  mode: "subscription", name: "Kids Reading" },
        kids_story_subscription: { amount: 999,  mode: "subscription", name: "Kids Story Subscription" },
        kids_subscription:       { amount: 999,  mode: "subscription", name: "Kids Subscription" },
        learning:                { amount: 1999, mode: "payment",      name: "Learning Course" },
        lie_detector:            { amount: 299,  mode: "payment",      name: "Lie Detector" },
        marketplace_item:        { amount: 999,  mode: "payment",      name: "Marketplace Item" },
        multiverse:              { amount: 1499, mode: "subscription", name: "Multiverse Premium" },
        pet:                     { amount: 999,  mode: "subscription", name: "Pet Premium" },
        photo_credits:           { amount: 999,  mode: "payment",      name: "Photo Credits" },
        property_listing:        { amount: 4999, mode: "payment",      name: "Property Listing" },
        lead_boost:              { amount: 1900, mode: "payment",      name: "Lead Boost" },
        virtual_tour:            { amount: 9900, mode: "payment",      name: "Virtual Tour Hosting" },
        psychology:              { amount: 1999, mode: "subscription", name: "Psychology Premium" },
        reincarnation:           { amount: 999,  mode: "payment",      name: "Reincarnation Reading" },
        science:                 { amount: 999,  mode: "subscription", name: "Science Premium" },
        shadow_subscription:     { amount: 200,  mode: "subscription", name: "Shadow Arena — Pact of the Seal" },
        shadow_battle:           { amount: 199,  mode: "payment",      name: "Shadow Battle Entry" },
        shadow_battle_join:      { amount: 199,  mode: "payment",      name: "Join Shadow Battle" },
        shadow_gift:             { amount: 299,  mode: "payment",      name: "Shadow Gift" },
        skill_swap:              { amount: 999,  mode: "subscription", name: "Skill Swap Premium" },
        sports:                  { amount: 999,  mode: "subscription", name: "Sports Premium" },
        subscription:            { amount: 999,  mode: "subscription", name: "Premium Subscription" },
        quantum_profiles:        { amount: 1299, mode: "subscription", name: "Quantum Profiles" },
        observer_mode:           { amount: 1999, mode: "subscription", name: "Quantum Observer Mode" },
        quantum_entanglement:    { amount: 999,  mode: "subscription", name: "Quantum Entanglement" },
        teen_career:             { amount: 499,  mode: "payment",      name: "Teen Career" },
        video_ad_credits:        { amount: 999,  mode: "payment",      name: "Video Ad Credits" },
        vip:                     { amount: 1999, mode: "subscription", name: "VIP" },
        wellness:                { amount: 999,  mode: "subscription", name: "Wellness Premium" },
        // Game / action products
        battle_characters:       { amount: 199,  mode: "payment",      name: "Battle Entry" },
        battle_pets:             { amount: 199,  mode: "payment",      name: "Pet Battle Entry" },
        best_friend_messages:    { amount: 499,  mode: "payment",      name: "Best Friend Messages" },
        psychology_messages:     { amount: 499,  mode: "payment",      name: "Psychology Messages" },
        content_pack:            { amount: 999,  mode: "payment",      name: "Content Pack" },
        premium_course:          { amount: 4999, mode: "payment",      name: "Premium Course" },
        stock_content:           { amount: 999,  mode: "payment",      name: "Stock Content" },
        tip:                     { amount: 299,  mode: "payment",      name: "Tip" },
        dating_gift:             { amount: 199,  mode: "payment",      name: "Dating Gift" },
        fashion_challenge_submit:{ amount: 199,  mode: "payment",      name: "Fashion Challenge Submission" },
        fashion_challenge_vote:  { amount: 99,   mode: "payment",      name: "Fashion Challenge Vote" },
        mystery_box_open:        { amount: 299,  mode: "payment",      name: "Mystery Box" },
        phobia_trade:            { amount: 199,  mode: "payment",      name: "Phobia Trade" },
        course_enroll:           { amount: 4999, mode: "payment",      name: "Course Enrollment" },
        coupon_marketplace:      { amount: 999,  mode: "subscription", name: "Coupon Marketplace Access" },
        dating_monthly:          { amount: 200,  mode: "subscription", name: "Dating Premium (Monthly)" },
        dating_yearly:           { amount: 2000, mode: "subscription", name: "Dating Premium (Yearly)" },
      };

      const def = PRODUCT_DEFAULTS[productKey];

      // Property Listing package overrides (basic/premium/featured)
      const PROPERTY_PACKAGES: Record<string, { amount: number; name: string }> = {
        basic:    { amount: 2900, name: "Basic Property Listing (30 days)" },
        premium:  { amount: 7900, name: "Premium Property Listing (60 days)" },
        featured: { amount: 14900, name: "Featured Property Listing (90 days)" },
      };
      const pkgOverride =
        productKey === "property_listing" && typeof body.packageType === "string"
          ? PROPERTY_PACKAGES[body.packageType]
          : undefined;

      const amount = Number(body.amount) || pkgOverride?.amount || def?.amount || 999;
      const productName = String(body.productName || pkgOverride?.name || def?.name || `${productKey} purchase`);
      const mode = (body.mode || def?.mode || "payment") as "payment" | "subscription";
      const { successUrl, cancelUrl } = resolveUrls(origin, body.successUrl, body.cancelUrl, productKey);

      // Modules whose subscription must resolve to a specific Stripe Product
      // (so check-subscription can match it via TIER_PRODUCTS).
      const FIXED_SUBSCRIPTION_PRICE: Record<string, string> = {
        crystal: "price_1TYP0KGaXSfGtYFtR5N4q75M", // prod_UXTyxI4d06YsU6, €10/mo
      };
      const fixedPrice = FIXED_SUBSCRIPTION_PRICE[productKey];

      const isSubscription = mode === "subscription";
      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [
          fixedPrice
            ? { price: fixedPrice, quantity: 1 }
            : {
                price_data: {
                  currency: "eur",
                  unit_amount: amount,
                  product_data: { name: productName },
                  ...(isSubscription ? { recurring: { interval: ((body.interval as "month" | "year") || (productKey === "dating_yearly" ? "year" : "month")) as "month" | "year" } } : {}),
                },
                quantity: 1,
              },
        ],
        mode,
        success_url: successUrl,
        cancel_url: cancelUrl,
        // Collect VAT / tax ID + billing address for B2B subscriptions (EU compliance)
        ...(isSubscription
          ? {
              tax_id_collection: { enabled: true },
              billing_address_collection: "required" as const,
              customer_update: customerId ? { address: "auto" as const, name: "auto" as const } : undefined,
            }
          : {}),
        metadata: {
          user_id: userId,
          type: productKey,
          product: productKey,
          ...stringifyMetadata(body.metadata || {}),
        },
      });

      return successResponse({ url: session.url, session_id: session.id });
    }

    if (body.credits) {
      const credits = Number(body.credits);
      const creditType = String(body.creditType || "antique");
      const pack = CREDIT_PACKS[creditType];
      if (!pack) throw new Error(`Unknown creditType: ${creditType}`);

      const priceId = pack.prices[credits];
      const successUrl = `${origin}${pack.successPath}`;
      const cancelUrl = `${origin}${pack.cancelPath}`;

      // Per-credit pricing for dynamic packs.
      // - chat: €0.10/credit
      // - creative_forge public packages (30/75/150/400 → €8/€18/€32/€75) — override below
      // - default: €0.50/credit
      const CREATIVE_FORGE_TOTALS: Record<number, number> = {
        30: 800, 75: 1800, 150: 3200, 400: 7500,
      };
      // Shadow Arena: 30 → €4.99, 100 → €12.99, 280 → €29.99
      const SHADOW_ARENA_TOTALS: Record<number, number> = {
        30: 499, 100: 1299, 280: 2999,
      };
      // Character Arena: 50 → €9.99, 200 → €29.99
      const CHARACTER_ARENA_TOTALS: Record<number, number> = {
        50: 999, 200: 2999,
      };
      const unitAmount = creditType === "chat" ? 10 : 50;
      const minTotal = creditType === "chat" ? 99 : 99; // €0.99 minimum
      const cfTotal = creditType === "creative_forge" ? CREATIVE_FORGE_TOTALS[credits] : undefined;
      const saTotal = creditType === "shadow_arena" ? SHADOW_ARENA_TOTALS[credits] : undefined;
      const caTotal = creditType === "character_arena" ? CHARACTER_ARENA_TOTALS[credits] : undefined;
      const lineItems = priceId
        ? [{ price: priceId, quantity: 1 }]
        : [{
            price_data: {
              currency: "eur" as const,
              unit_amount: cfTotal ?? saTotal ?? caTotal ?? Math.max(minTotal, credits * unitAmount),
              product_data: { name: `${creditType} Credits - ${credits} Pack` },
            },
            quantity: 1,
          }];

      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: lineItems,
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          user_id: userId,
          credits: String(credits),
          type: `${creditType}_credits`,
          // verify-credits-payment uses `credit_type` directly as the table name.
          credit_type:
            creditType === "science" ? "science_credits"
            : creditType === "homework" ? "homework_credits"
            : creditType === "chat" ? "chat_credits"
            : creditType === "kids_drawing" ? "kids_drawing_credits"
            : creditType === "kids_reading" ? "kids_reading_credits"
            : creditType === "kids_story" ? "kids_story_credits"
            : creditType === "kids_academy" ? "kids_academy_credits"
            : creditType === "teen_career" ? "teen_career_credits"
            : creditType === "teen_hub" ? "teen_credits"
            : creditType === "coloring" ? "coloring_credits"
            : creditType === "creative_forge" ? "creative_forge_credits"
            : creditType === "shadow_arena" ? "shadow_arena_credits"
            : creditType === "collectibles" ? "collectibles_credits"
            : creditType === "character_arena" ? "character_credits"
            : creditType === "iq" ? "iq_credits"
            : creditType === "handwriting" ? "handwriting_credits"
            : creditType === "creative_forge" ? "creative_forge_credits"
            : creditType,
        },
      });

      return successResponse({ url: session.url, session_id: session.id });
    }

    const productKey = body.productKey as string | undefined;
    const rawPriceId = body.priceId as string | undefined;
    const requestMetadata = stringifyMetadata(body.metadata || {});

    if (productKey && CLONE_PRODUCTS[productKey]) {
      const cloneProduct = CLONE_PRODUCTS[productKey];
      const { successUrl, cancelUrl } = resolveUrls(origin, body.successUrl, body.cancelUrl, cloneProduct.metadata.type);

      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [{
          price_data: {
            currency: "eur",
            unit_amount: cloneProduct.amount,
            product_data: { name: cloneProduct.name },
            ...(cloneProduct.mode === "subscription" ? { recurring: { interval: "month" as const } } : {}),
          },
          quantity: 1,
        }],
        mode: cloneProduct.mode,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { user_id: userId, ...cloneProduct.metadata, ...requestMetadata },
      });

      return successResponse({ url: session.url, session_id: session.id });
    }

    if (rawPriceId === "crystal_sub_box") {
      const { successUrl, cancelUrl } = resolveUrls(origin, body.successUrl, body.cancelUrl, "crystal_energy");

      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [{
          price_data: {
            currency: "eur",
            unit_amount: 2900,
            recurring: { interval: "month" },
            product_data: { name: "Crystal Subscription Box" },
          },
          quantity: 1,
        }],
        mode: "subscription",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          user_id: userId,
          type: "crystal_energy",
          feature: "Crystal Subscription Box",
          feature_key: "crystal_sub_box",
          ...requestMetadata,
        },
      });

      return successResponse({ url: session.url, session_id: session.id });
    }

    if (productKey && SPORTS_PACKS[productKey]) {
      // Match by priceId key OR fallback to metadata.coins lookup (frontend may send real Stripe price IDs)
      const packs = SPORTS_PACKS[productKey];
      const requestedCoins = Number(requestMetadata.coins) || 0;
      const selectedPack =
        (rawPriceId && packs[rawPriceId]) ||
        Object.values(packs).find((p) => p.coins === requestedCoins);
      if (!selectedPack) {
        return errorResponse(`No matching pack for ${productKey} (priceId=${rawPriceId}, coins=${requestedCoins})`, 400);
      }
      const { successUrl, cancelUrl } = resolveUrls(origin, body.successUrl, body.cancelUrl, productKey);

      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [{
          price_data: {
            currency: "eur",
            unit_amount: selectedPack.amount,
            product_data: { name: `${productKey.replace(/_/g, " ")} - ${selectedPack.coins} coins` },
          },
          quantity: 1,
        }],
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          user_id: userId,
          type: productKey,
          credits: String(requestMetadata.coins || selectedPack.coins),
          coins: String(requestMetadata.coins || selectedPack.coins),
          ...requestMetadata,
        },
      });

      return successResponse({ url: session.url, session_id: session.id });
    }

    if (body.productName && body.amount) {
      const paymentType = requestMetadata.type || productKey || "custom_payment";
      const { successUrl, cancelUrl } = resolveUrls(origin, body.successUrl, body.cancelUrl, paymentType);
      const isSub = body.mode === "subscription";
      const interval = (body.interval as "day" | "week" | "month" | "year" | undefined) || "month";

      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [{
          price_data: {
            currency: "eur",
            unit_amount: Number(body.amount),
            product_data: { name: String(body.productName) },
            ...(isSub ? { recurring: { interval } } : {}),
          },
          quantity: 1,
        }],
        mode: isSub ? "subscription" : "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { user_id: userId, ...requestMetadata },
      });

      return successResponse({ url: session.url, session_id: session.id });
    }

    if (rawPriceId?.startsWith("price_1")) {
      const paymentType = requestMetadata.type || productKey;
      const { successUrl, cancelUrl } = resolveUrls(origin, body.successUrl, body.cancelUrl, paymentType);

      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [{ price: rawPriceId, quantity: 1 }],
        mode: body.mode === "subscription" ? "subscription" : "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { user_id: userId, ...requestMetadata },
      });

      return successResponse({ url: session.url, session_id: session.id });
    }

    throw new Error("Unsupported checkout request");
  } catch (error) {
    log("ERROR", { message: error instanceof Error ? error.message : String(error) });
    return errorResponse(error);
  }
});
