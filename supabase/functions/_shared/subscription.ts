import { createStripeClient, getStripeCustomer, hasActiveSubscription, hasCompletedPayment } from "./stripe.ts";
import { authenticateUser } from "./supabaseClient.ts";
import { successResponse, errorResponse, handleCors } from "./response.ts";
import { createLogger } from "./logger.ts";

export interface SubscriptionConfig {
  /** Map of tier name to price ID */
  priceIds?: Record<string, string>;
  /** Map of tier name to product ID (for one-time purchases) */
  productIds?: Record<string, string>;
  /** Whether to check for lifetime/one-time purchases */
  checkLifetime?: boolean;
  /** Custom tier resolver based on price/product ID */
  tierResolver?: (priceId: string | null, productId: string | null) => string | null;
}

export interface SubscriptionResult {
  subscribed: boolean;
  tier: string | null;
  priceId: string | null;
  productId: string | null;
  subscriptionEnd: string | null;
  isLifetime: boolean;
}

/**
 * Creates a universal subscription check handler
 */
export function createSubscriptionCheckHandler(config: SubscriptionConfig, functionName: string) {
  const log = createLogger(functionName);

  return async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
      return handleCors();
    }

    try {
      log("Function started");

      const { user, userId, email } = await authenticateUser(req);
      if (!email) throw new Error("User email not available");
      log("User authenticated", { userId, email });

      const stripe = createStripeClient();
      const customerId = await getStripeCustomer(stripe, email);

      if (!customerId) {
        log("No Stripe customer found");
        return successResponse({
          subscribed: false,
          tier: null,
          subscription_end: null,
          is_lifetime: false,
        });
      }

      log("Found Stripe customer", { customerId });

      // Check active subscriptions
      const priceIdList = config.priceIds ? Object.values(config.priceIds) : undefined;
      const subscriptionResult = await hasActiveSubscription(stripe, customerId, priceIdList);

      if (subscriptionResult.hasSubscription) {
        const tier = resolveTier(
          subscriptionResult.priceId,
          subscriptionResult.productId,
          config
        );
        
        log("Active subscription found", { 
          tier, 
          priceId: subscriptionResult.priceId,
          subscriptionEnd: subscriptionResult.subscriptionEnd 
        });

        return successResponse({
          subscribed: true,
          tier,
          price_id: subscriptionResult.priceId,
          product_id: subscriptionResult.productId,
          subscription_end: subscriptionResult.subscriptionEnd,
          is_lifetime: false,
        });
      }

      // Check lifetime purchases if configured
      if (config.checkLifetime && config.productIds) {
        const productIdList = Object.values(config.productIds);
        const purchaseResult = await hasCompletedPayment(stripe, customerId, productIdList);

        if (purchaseResult.hasPurchase) {
          const tier = resolveTier(null, purchaseResult.productId, config);
          
          log("Lifetime purchase found", { tier, productId: purchaseResult.productId });

          return successResponse({
            subscribed: true,
            tier,
            product_id: purchaseResult.productId,
            subscription_end: null,
            is_lifetime: true,
          });
        }
      }

      log("No active subscription or purchase found");
      return successResponse({
        subscribed: false,
        tier: null,
        subscription_end: null,
        is_lifetime: false,
      });
    } catch (error) {
      log("ERROR", { message: error instanceof Error ? error.message : String(error) });
      return errorResponse(error);
    }
  };
}

/**
 * Resolves tier name from price or product ID
 */
function resolveTier(
  priceId: string | null,
  productId: string | null,
  config: SubscriptionConfig
): string | null {
  // Use custom resolver if provided
  if (config.tierResolver) {
    return config.tierResolver(priceId, productId);
  }

  // Check price IDs
  if (priceId && config.priceIds) {
    for (const [tier, id] of Object.entries(config.priceIds)) {
      if (id === priceId) return tier;
    }
  }

  // Check product IDs
  if (productId && config.productIds) {
    for (const [tier, id] of Object.entries(config.productIds)) {
      if (id === productId) return tier;
    }
  }

  return null;
}

/**
 * Creates a simple subscription check (no tiers, just active/inactive)
 */
export function createSimpleSubscriptionCheckHandler(functionName: string) {
  return createSubscriptionCheckHandler({}, functionName);
}

/**
 * Creates a customer portal handler
 */
export function createCustomerPortalHandler(returnUrl: string, functionName: string) {
  const log = createLogger(functionName);

  return async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
      return handleCors();
    }

    try {
      log("Function started");

      const { user, userId, email } = await authenticateUser(req);
      if (!email) throw new Error("User email not available");
      log("User authenticated", { userId, email });

      const stripe = createStripeClient();
      const customerId = await getStripeCustomer(stripe, email);

      if (!customerId) {
        throw new Error("No Stripe customer found for this user");
      }

      log("Found Stripe customer", { customerId });

      const origin = req.headers.get("origin") || "";
      const fullReturnUrl = returnUrl.startsWith("http") 
        ? returnUrl 
        : `${origin}${returnUrl}`;

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: fullReturnUrl,
      });

      log("Portal session created", { sessionId: portalSession.id });
      return successResponse({ url: portalSession.url });
    } catch (error) {
      log("ERROR", { message: error instanceof Error ? error.message : String(error) });
      return errorResponse(error);
    }
  };
}
