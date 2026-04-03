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

const ANTIQUE_PRICE_IDS: Record<number, string> = {
  10: "price_1SOII2GaXSfGtYFtPltUZvxb",
  25: "price_1SOIIMGaXSfGtYFtonaY4jqs",
  60: "price_1SOIItGaXSfGtYFtvHTuEutU",
  150: "price_1SOIJE0QTWhd4oRpow80Xeyd",
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
  basketball_coins: { success: "/basketball-arena?payment=success&session_id={CHECKOUT_SESSION_ID}", cancel: "/basketball-arena?payment=canceled" },
  football_coins: { success: "/football-arena?payment=success&session_id={CHECKOUT_SESSION_ID}", cancel: "/football-arena?payment=canceled" },
  hockey_coins: { success: "/hockey-arena?payment=success&session_id={CHECKOUT_SESSION_ID}", cancel: "/hockey-arena?payment=canceled" },
  tennis_coins: { success: "/tennis-arena?payment=success&session_id={CHECKOUT_SESSION_ID}", cancel: "/tennis-arena?payment=canceled" },
  af_coins: { success: "/american-football-arena?payment=success&session_id={CHECKOUT_SESSION_ID}", cancel: "/american-football-arena?payment=canceled" },
  clone_subscription: { success: "/ai-clone?payment=success&session_id={CHECKOUT_SESSION_ID}", cancel: "/ai-clone?payment=canceled" },
  clone_dating: { success: "/ai-clone?payment=success&session_id={CHECKOUT_SESSION_ID}", cancel: "/ai-clone?payment=canceled" },
  crystal_energy: { success: "/crystal-energy-network?success=true&session_id={CHECKOUT_SESSION_ID}", cancel: "/crystal-energy-network?canceled=true" },
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
    const { userId, email } = await authenticateUser(req);
    if (!email) throw new Error("User email not available");

    const body = await req.json();
    const stripe = createStripeClient();
    const customerId = await getStripeCustomer(stripe, email);
    const origin = req.headers.get("origin") || "";

    if (body.credits) {
      const credits = Number(body.credits);
      const priceId = ANTIQUE_PRICE_IDS[credits];
      if (!priceId) throw new Error(`Invalid credits amount: ${credits}`);

      const { successUrl, cancelUrl } = resolveUrls(origin, undefined, undefined, "antique_credits");
      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { user_id: userId, credits: String(credits), type: "antique_credits" },
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

    if (productKey && SPORTS_PACKS[productKey]?.[rawPriceId]) {
      const selectedPack = SPORTS_PACKS[productKey][rawPriceId];
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

      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [{
          price_data: {
            currency: "eur",
            unit_amount: Number(body.amount),
            product_data: { name: String(body.productName) },
          },
          quantity: 1,
        }],
        mode: body.mode === "subscription" ? "subscription" : "payment",
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
