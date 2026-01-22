import { createStripeClient, getStripeCustomer, hasActiveSubscription, hasCompletedPayment } from "./stripe.ts";
import { authenticateUser, createSupabaseAdminClient } from "./supabaseClient.ts";
import { successResponse, errorResponse, handleCors } from "./response.ts";
import { createLogger } from "./logger.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

export interface SubscriptionConfig {
  /** Function name for logging */
  functionName: string;
  /** Map of price ID to tier name */
  tierMapping?: Record<string, string>;
  /** Table name for additional data */
  tableName?: string;
  /** Whether to use product ID instead of price ID */
  useProductId?: boolean;
  /** Default response when no subscription found */
  defaultResponse?: Record<string, unknown>;
  /** Custom response mapping function */
  responseMapping?: (data: Record<string, unknown>) => Record<string, unknown>;
  /** Additional fields to include in response */
  additionalFields?: (
    supabase: SupabaseClient, 
    userId: string, 
    tier: string | null, 
    productId: string | null
  ) => Promise<Record<string, unknown>>;
  /** Whether to check for lifetime/one-time purchases */
  checkLifetime?: boolean;
  /** Product IDs for lifetime purchases */
  lifetimeProducts?: Record<string, string>;
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
export function createSubscriptionCheckHandler(config: SubscriptionConfig) {
  const log = createLogger(config.functionName);

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
      const supabase = createSupabaseAdminClient();

      const defaultNoSubResponse = config.defaultResponse || {
        subscribed: false,
        product_id: null,
        tier: null,
        subscription_end: null,
      };

      if (!customerId) {
        log("No Stripe customer found");
        return successResponse(defaultNoSubResponse);
      }

      log("Found Stripe customer", { customerId });

      // Check active subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        // Check lifetime purchases if configured
        if (config.checkLifetime && config.lifetimeProducts) {
          const purchaseResult = await hasCompletedPayment(
            stripe, 
            customerId, 
            Object.values(config.lifetimeProducts)
          );

          if (purchaseResult.hasPurchase) {
            const tier = findTierByProductId(purchaseResult.productId, config.lifetimeProducts);
            log("Lifetime purchase found", { tier });

            let response: Record<string, unknown> = {
              subscribed: true,
              tier,
              product_id: purchaseResult.productId,
              subscription_end: null,
              is_lifetime: true,
            };

            return successResponse(
              config.responseMapping ? config.responseMapping(response) : response
            );
          }
        }

        log("No active subscription found");
        return successResponse(defaultNoSubResponse);
      }

      const subscription = subscriptions.data[0];
      const priceId = subscription.items.data[0].price.id;
      const productId = subscription.items.data[0].price.product as string;
      const subscriptionEnd = subscription.current_period_end 
        ? new Date(subscription.current_period_end * 1000).toISOString() 
        : null;

      // Resolve tier
      let tier: string | null = null;
      if (config.tierMapping) {
        const lookupId = config.useProductId ? productId : priceId;
        tier = config.tierMapping[lookupId] || null;
      }

      log("Active subscription found", { tier, priceId, productId, subscriptionEnd });

      // Build response
      let response: Record<string, unknown> = {
        subscribed: true,
        tier,
        price_id: priceId,
        product_id: productId,
        subscription_end: subscriptionEnd,
      };

      // Add additional fields if configured
      if (config.additionalFields) {
        const additionalData = await config.additionalFields(supabase, userId, tier, productId);
        response = { ...response, ...additionalData };
      }

      // Apply response mapping if configured
      if (config.responseMapping) {
        response = config.responseMapping(response);
      }

      return successResponse(response);
    } catch (error) {
      log("ERROR", { message: error instanceof Error ? error.message : String(error) });
      return errorResponse(error);
    }
  };
}

/**
 * Find tier name by product ID
 */
function findTierByProductId(
  productId: string | null, 
  products: Record<string, string>
): string | null {
  if (!productId) return null;
  for (const [tier, id] of Object.entries(products)) {
    if (id === productId) return tier;
  }
  return null;
}

/**
 * Creates a simple subscription check (no tiers, just active/inactive)
 */
export function createSimpleSubscriptionCheckHandler(functionName: string) {
  return createSubscriptionCheckHandler({ functionName });
}

/**
 * Creates a customer portal handler
 */
export function createCustomerPortalHandler(config: { functionName: string; returnPath?: string }) {
  const log = createLogger(config.functionName);

  return async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
      return handleCors();
    }

    try {
      log("Function started");

      const { userId, email } = await authenticateUser(req);
      if (!email) throw new Error("User email not available");
      log("User authenticated", { userId, email });

      const stripe = createStripeClient();
      const customerId = await getStripeCustomer(stripe, email);

      if (!customerId) {
        throw new Error("No Stripe customer found for this user");
      }

      log("Found Stripe customer", { customerId });

      const origin = req.headers.get("origin") || "";
      const returnUrl = `${origin}${config.returnPath || "/"}`;

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      log("Portal session created", { sessionId: portalSession.id });
      return successResponse({ url: portalSession.url });
    } catch (error) {
      log("ERROR", { message: error instanceof Error ? error.message : String(error) });
      return errorResponse(error);
    }
  };
}
