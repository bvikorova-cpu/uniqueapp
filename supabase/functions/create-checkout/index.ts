import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { authenticateUser } from "../_shared/supabaseClient.ts";
import { createLogger } from "../_shared/logger.ts";
import { errorResponse, handleCors, successResponse } from "../_shared/response.ts";
import { createStripeClient, getStripeCustomer } from "../_shared/stripe.ts";
import { RATE_LIMITS, withRateLimit } from "../_shared/rateLimit.ts";

const log = createLogger("CREATE-CHECKOUT");

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

      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : (donorEmail || email),
        line_items: [{
          price_data: {
            currency: "eur",
            unit_amount: Math.round(donationAmount * 100),
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
        },
      });

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
            : creditType === "coloring" ? "coloring_credits"
            : creditType === "creative_forge" ? "creative_forge_credits"
            : creditType === "shadow_arena" ? "shadow_arena_credits"
            : creditType === "collectibles" ? "collectibles_credits"
            : creditType === "character_arena" ? "character_credits"
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
