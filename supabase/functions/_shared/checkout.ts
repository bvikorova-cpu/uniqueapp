import Stripe from "https://esm.sh/stripe@18.5.0";
import { createStripeClient, getStripeCustomer, getOrCreateStripeCustomer } from "./stripe.ts";
import { authenticateUser } from "./supabaseClient.ts";
import { corsHeaders, successResponse, errorResponse, handleCors } from "./response.ts";
import { createLogger } from "./logger.ts";

export interface CheckoutConfig {
  /** Price ID from Stripe */
  priceId: string;
  /** "subscription" or "payment" */
  mode: "subscription" | "payment";
  /** URL to redirect after successful payment */
  successUrl: string;
  /** URL to redirect if payment is cancelled */
  cancelUrl: string;
  /** Optional metadata to attach to the session */
  metadata?: Record<string, string>;
  /** Quantity (default: 1) */
  quantity?: number;
  /** Allow promotion codes */
  allowPromotionCodes?: boolean;
}

export interface DynamicCheckoutConfig {
  /** Map of tier/type to price ID */
  priceIds: Record<string, string>;
  /** "subscription" or "payment" */
  mode: "subscription" | "payment";
  /** Base success URL (tier will be appended as query param) */
  successUrlBase: string;
  /** Base cancel URL */
  cancelUrlBase: string;
  /** Name of the tier parameter in request body (default: "tier") */
  tierParam?: string;
  /** Additional metadata */
  metadata?: Record<string, string>;
}

export interface FlexibleCheckoutConfig {
  /** Base success URL */
  successUrl: string;
  /** Base cancel URL */
  cancelUrl: string;
  /** Default mode if not specified in request */
  defaultMode?: "subscription" | "payment";
  /** Additional static metadata */
  metadata?: Record<string, string>;
  /** Fields to extract from body to metadata */
  metadataFields?: string[];
}

/**
 * Creates a simple checkout handler for a single price
 */
export function createCheckoutHandler(config: CheckoutConfig, functionName: string) {
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
      log("Stripe customer lookup", { customerId: customerId || "new" });

      const origin = req.headers.get("origin") || "";
      
      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [
          {
            price: config.priceId,
            quantity: config.quantity || 1,
          },
        ],
        mode: config.mode,
        success_url: config.successUrl.startsWith("http") 
          ? config.successUrl 
          : `${origin}${config.successUrl}`,
        cancel_url: config.cancelUrl.startsWith("http") 
          ? config.cancelUrl 
          : `${origin}${config.cancelUrl}`,
        metadata: {
          user_id: userId,
          ...config.metadata,
        },
        allow_promotion_codes: config.allowPromotionCodes,
      });

      log("Checkout session created", { sessionId: session.id });
      return successResponse({ url: session.url, session_id: session.id });
    } catch (error) {
      log("ERROR", { message: error instanceof Error ? error.message : String(error) });
      return errorResponse(error);
    }
  };
}

/**
 * Creates a dynamic checkout handler that accepts tier/type from request body
 */
export function createDynamicCheckoutHandler(config: DynamicCheckoutConfig, functionName: string) {
  const log = createLogger(functionName);
  const tierParam = config.tierParam || "tier";

  return async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
      return handleCors();
    }

    try {
      log("Function started");

      const { user, userId, email } = await authenticateUser(req);
      if (!email) throw new Error("User email not available");
      log("User authenticated", { userId, email });

      const body = await req.json();
      const tier = body[tierParam];
      
      if (!tier || !config.priceIds[tier]) {
        const validTiers = Object.keys(config.priceIds).join(", ");
        throw new Error(`Invalid ${tierParam}: ${tier}. Valid options: ${validTiers}`);
      }

      const priceId = config.priceIds[tier];
      log("Selected tier", { tier, priceId });

      const stripe = createStripeClient();
      const customerId = await getStripeCustomer(stripe, email);
      log("Stripe customer lookup", { customerId: customerId || "new" });

      const origin = req.headers.get("origin") || "";
      
      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: config.mode,
        success_url: `${origin}${config.successUrlBase}?success=true&tier=${tier}`,
        cancel_url: `${origin}${config.cancelUrlBase}?canceled=true`,
        metadata: {
          user_id: userId,
          tier,
          ...config.metadata,
        },
      });

      log("Checkout session created", { sessionId: session.id, tier });
      return successResponse({ url: session.url, session_id: session.id });
    } catch (error) {
      log("ERROR", { message: error instanceof Error ? error.message : String(error) });
      return errorResponse(error);
    }
  };
}

/**
 * Creates a credits checkout handler that accepts credits amount
 */
export function createCreditsCheckoutHandler(
  priceIds: Record<number, string>,
  successUrl: string,
  cancelUrl: string,
  metadataType: string,
  functionName: string
) {
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

      const { credits } = await req.json();
      
      if (!credits || !priceIds[credits]) {
        const validAmounts = Object.keys(priceIds).join(", ");
        throw new Error(`Invalid credits amount: ${credits}. Valid options: ${validAmounts}`);
      }

      log("Selected credits", { credits, priceId: priceIds[credits] });

      const stripe = createStripeClient();
      const customerId = await getStripeCustomer(stripe, email);

      const origin = req.headers.get("origin") || "";
      
      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [
          {
            price: priceIds[credits],
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}${successUrl}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}${cancelUrl}?payment=canceled`,
        metadata: {
          user_id: userId,
          credits: credits.toString(),
          type: metadataType,
        },
      });

      log("Checkout session created", { sessionId: session.id, credits });
      return successResponse({ url: session.url, session_id: session.id });
    } catch (error) {
      log("ERROR", { message: error instanceof Error ? error.message : String(error) });
      return errorResponse(error);
    }
  };
}

/**
 * Creates a flexible checkout handler that accepts priceId and optional mode from body
 * Supports: priceId, tier, isLifetime flags from request body
 */
export function createFlexibleCheckoutHandler(config: FlexibleCheckoutConfig, functionName: string) {
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

      const body = await req.json();
      const { priceId, tier, isLifetime } = body;
      
      if (!priceId) throw new Error("Price ID is required");
      log("Received request", { priceId, tier, isLifetime });

      const stripe = createStripeClient();
      const customerId = await getStripeCustomer(stripe, email);
      log("Stripe customer lookup", { customerId: customerId || "new" });

      // Determine mode: isLifetime=true means one-time payment
      const mode = isLifetime ? "payment" : (config.defaultMode || "subscription");
      const origin = req.headers.get("origin") || "";

      // Build metadata
      const metadata: Record<string, string> = {
        user_id: userId,
        ...(config.metadata || {}),
      };
      
      if (tier) metadata.tier = tier;
      if (isLifetime !== undefined) metadata.is_lifetime = String(isLifetime);
      
      // Add additional fields from body to metadata
      if (config.metadataFields) {
        for (const field of config.metadataFields) {
          if (body[field] !== undefined) {
            metadata[field] = String(body[field]);
          }
        }
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [{ price: priceId, quantity: 1 }],
        mode,
        success_url: `${origin}${config.successUrl}`,
        cancel_url: `${origin}${config.cancelUrl}`,
        metadata,
      });

      log("Checkout session created", { sessionId: session.id, mode });
      return successResponse({ url: session.url, session_id: session.id });
    } catch (error) {
      log("ERROR", { message: error instanceof Error ? error.message : String(error) });
      return errorResponse(error);
    }
  };
}
