import Stripe from "https://esm.sh/stripe@18.5.0";
import { createStripeClient, getStripeCustomer } from "./stripe.ts";
import { authenticateUser } from "./supabaseClient.ts";
import { successResponse, errorResponse, handleCors } from "./response.ts";
import { createLogger } from "./logger.ts";
import { withRateLimit, RATE_LIMITS, addRateLimitHeaders } from "./rateLimit.ts";
export interface CheckoutConfig {
  /** Function name for logging */
  functionName: string;
  /** Price ID from Stripe (if known) */
  priceId?: string;
  /** Lookup key to find or create price */
  lookupKey?: string;
  /** Product name for dynamic price creation */
  productName?: string;
  /** Product description */
  productDescription?: string;
  /** Price amount in cents */
  priceAmount?: number;
  /** Currency */
  currency?: string;
  /** Recurring interval */
  recurringInterval?: "day" | "week" | "month" | "year";
  /** "subscription" or "payment" */
  mode: "subscription" | "payment";
  /** Success path (origin will be prepended) */
  successPath: string;
  /** Cancel path (origin will be prepended) */
  cancelPath: string;
  /** Optional metadata to attach to the session */
  metadata?: Record<string, string>;
  /** Quantity (default: 1) */
  quantity?: number;
  /** Allow promotion codes */
  allowPromotionCodes?: boolean;
}

export interface DynamicCheckoutConfig {
  /** Function name for logging */
  functionName: string;
  /** Map of tier/type to price ID */
  tierPrices: Record<string, string>;
  /** "subscription" or "payment" */
  mode: "subscription" | "payment";
  /** Success path */
  successPath: string;
  /** Cancel path */
  cancelPath: string;
  /** Name of the tier key in request body (default: "tier") */
  tierKey?: string;
  /** Additional metadata */
  metadata?: Record<string, string>;
  /** Function to generate metadata from body */
  metadataFn?: (body: Record<string, unknown>) => Record<string, string>;
}

export interface FlexibleCheckoutConfig {
  /** Function name for logging */
  functionName: string;
  /** Success path */
  successPath: string;
  /** Cancel path */
  cancelPath: string;
  /** Key to get priceId from body */
  priceIdFromBody?: string;
  /** Default mode if not specified in request */
  defaultMode?: "subscription" | "payment";
  /** Default mode */
  mode?: "subscription" | "payment";
  /** Additional static metadata */
  metadata?: Record<string, string>;
  /** Fields to extract from body to metadata */
  metadataFields?: string[];
}

/**
 * Creates a simple checkout handler for a single price
 */
export function createCheckoutHandler(config: CheckoutConfig) {
  const log = createLogger(config.functionName);
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  };

  return async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
      return handleCors();
    }

    // Rate limiting check
    const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.checkout, corsHeaders);
    if (rateLimitResponse) {
      log("Rate limit exceeded");
      return rateLimitResponse;
    }

    try {
      log("Function started");

      const { userId, email } = await authenticateUser(req);
      if (!email) throw new Error("User email not available");
      log("User authenticated", { userId, email });

      const stripe = createStripeClient();
      const customerId = await getStripeCustomer(stripe, email);
      log("Stripe customer lookup", { customerId: customerId || "new" });

      const origin = req.headers.get("origin") || "";
      
      // Determine priceId
      let priceId = config.priceId;
      
      if (!priceId && config.lookupKey) {
        // Try to find by lookup key
        const prices = await stripe.prices.list({ lookup_keys: [config.lookupKey], limit: 1 });
        if (prices.data.length > 0) {
          priceId = prices.data[0].id;
        }
      }
      
      // Create price dynamically if not found
      if (!priceId && config.productName && config.priceAmount) {
        const product = await stripe.products.create({
          name: config.productName,
          description: config.productDescription,
        });
        
        const priceData: Stripe.PriceCreateParams = {
          product: product.id,
          unit_amount: config.priceAmount,
          currency: config.currency || "eur",
          lookup_key: config.lookupKey,
        };
        
        if (config.mode === "subscription" && config.recurringInterval) {
          priceData.recurring = { interval: config.recurringInterval };
        }
        
        const price = await stripe.prices.create(priceData);
        priceId = price.id;
      }
      
      if (!priceId) throw new Error("Could not determine price ID");
      
      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [{ price: priceId, quantity: config.quantity || 1 }],
        mode: config.mode,
        success_url: `${origin}${config.successPath}`,
        cancel_url: `${origin}${config.cancelPath}`,
        metadata: { user_id: userId, ...config.metadata },
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
export function createDynamicCheckoutHandler(config: DynamicCheckoutConfig) {
  const log = createLogger(config.functionName);
  const tierKey = config.tierKey || "tier";
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  };

  return async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
      return handleCors();
    }

    // Rate limiting check
    const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.checkout, corsHeaders);
    if (rateLimitResponse) {
      log("Rate limit exceeded");
      return rateLimitResponse;
    }

    try {
      log("Function started");

      const { userId, email } = await authenticateUser(req);
      if (!email) throw new Error("User email not available");
      log("User authenticated", { userId, email });

      const body = await req.json();
      const tier = body[tierKey];
      
      if (!tier || !config.tierPrices[tier]) {
        const validTiers = Object.keys(config.tierPrices).join(", ");
        throw new Error(`Invalid ${tierKey}: ${tier}. Valid options: ${validTiers}`);
      }

      const priceId = config.tierPrices[tier];
      log("Selected tier", { tier, priceId });

      const stripe = createStripeClient();
      const customerId = await getStripeCustomer(stripe, email);
      log("Stripe customer lookup", { customerId: customerId || "new" });

      const origin = req.headers.get("origin") || "";
      
      // Build metadata
      let metadata: Record<string, string> = { user_id: userId, tier, ...config.metadata };
      if (config.metadataFn) {
        metadata = { ...metadata, ...config.metadataFn(body) };
      }
      
      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: config.mode,
        success_url: `${origin}${config.successPath}`,
        cancel_url: `${origin}${config.cancelPath}`,
        metadata,
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
  successPath: string,
  cancelPath: string,
  metadataType: string,
  functionName: string
) {
  const log = createLogger(functionName);
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  };

  return async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
      return handleCors();
    }

    // Rate limiting check
    const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.checkout, corsHeaders);
    if (rateLimitResponse) {
      log("Rate limit exceeded");
      return rateLimitResponse;
    }

    try {
      log("Function started");

      const { userId, email } = await authenticateUser(req);
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
        line_items: [{ price: priceIds[credits], quantity: 1 }],
        mode: "payment",
        success_url: `${origin}${successPath}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}${cancelPath}?payment=canceled`,
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
 */
export function createFlexibleCheckoutHandler(config: FlexibleCheckoutConfig) {
  const log = createLogger(config.functionName);
  const priceIdKey = config.priceIdFromBody || "priceId";
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  };

  return async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
      return handleCors();
    }

    // Rate limiting check
    const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.checkout, corsHeaders);
    if (rateLimitResponse) {
      log("Rate limit exceeded");
      return rateLimitResponse;
    }

    try {
      log("Function started");

      const { userId, email } = await authenticateUser(req);
      if (!email) throw new Error("User email not available");
      log("User authenticated", { userId, email });

      const body = await req.json();
      const priceId = body[priceIdKey];
      const { tier, isLifetime } = body;
      
      if (!priceId) throw new Error("Price ID is required");
      log("Received request", { priceId, tier, isLifetime });

      const stripe = createStripeClient();
      const customerId = await getStripeCustomer(stripe, email);
      log("Stripe customer lookup", { customerId: customerId || "new" });

      // Determine mode
      const mode = isLifetime ? "payment" : (config.mode || config.defaultMode || "subscription");
      const origin = req.headers.get("origin") || "";

      // Build metadata
      const metadata: Record<string, string> = { user_id: userId, ...(config.metadata || {}) };
      if (tier) metadata.tier = tier;
      if (isLifetime !== undefined) metadata.is_lifetime = String(isLifetime);
      
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
        success_url: `${origin}${config.successPath}`,
        cancel_url: `${origin}${config.cancelPath}`,
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

export interface ServiceCheckoutConfig {
  /** Function name for logging */
  functionName: string;
  /** Map of service type to price ID */
  servicePrices: Record<string, string>;
  /** Service types that are subscriptions (others are payments) */
  subscriptionServices?: string[];
  /** Success path */
  successPath: string;
  /** Cancel path */
  cancelPath: string;
  /** Key name for service type in body (default: "serviceType") */
  serviceKey?: string;
}

/**
 * Creates a service checkout handler with dynamic mode based on service type
 */
export function createServiceCheckoutHandler(config: ServiceCheckoutConfig) {
  const log = createLogger(config.functionName);
  const serviceKey = config.serviceKey || "serviceType";
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  };

  return async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
      return handleCors();
    }

    // Rate limiting check
    const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.checkout, corsHeaders);
    if (rateLimitResponse) {
      log("Rate limit exceeded");
      return rateLimitResponse;
    }

    try {
      log("Function started");

      const { userId, email } = await authenticateUser(req);
      if (!email) throw new Error("User email not available");
      log("User authenticated", { userId, email });

      const body = await req.json();
      const serviceType = body[serviceKey];
      
      const priceId = config.servicePrices[serviceType];
      if (!priceId) {
        const validServices = Object.keys(config.servicePrices).join(", ");
        throw new Error(`Invalid ${serviceKey}: ${serviceType}. Valid options: ${validServices}`);
      }

      log("Selected service", { serviceType, priceId });

      const stripe = createStripeClient();
      const customerId = await getStripeCustomer(stripe, email);
      log("Stripe customer lookup", { customerId: customerId || "new" });

      const origin = req.headers.get("origin") || "";
      
      // Determine mode based on subscription services list
      const mode = config.subscriptionServices?.includes(serviceType) ? "subscription" : "payment";

      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [{ price: priceId, quantity: 1 }],
        mode,
        success_url: `${origin}${config.successPath}`,
        cancel_url: `${origin}${config.cancelPath}`,
        metadata: { user_id: userId, service_type: serviceType },
      });

      log("Checkout session created", { sessionId: session.id, serviceType, mode });
      return successResponse({ url: session.url, session_id: session.id });
    } catch (error) {
      log("ERROR", { message: error instanceof Error ? error.message : String(error) });
      return errorResponse(error);
    }
  };
}

export interface PackageCheckoutConfig {
  /** Function name for logging */
  functionName: string;
  /** Map of package type to { credits, priceId } */
  packages: Record<string, { credits: number; price: string }>;
  /** Success path */
  successPath: string;
  /** Cancel path */
  cancelPath: string;
  /** Metadata type */
  metadataType: string;
  /** Package key in body (default: "packageType") */
  packageKey?: string;
}

/**
 * Creates a package checkout handler for credits packages
 */
export function createPackageCheckoutHandler(config: PackageCheckoutConfig) {
  const log = createLogger(config.functionName);
  const packageKey = config.packageKey || "packageType";
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  };

  return async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
      return handleCors();
    }

    // Rate limiting check
    const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.checkout, corsHeaders);
    if (rateLimitResponse) {
      log("Rate limit exceeded");
      return rateLimitResponse;
    }

    try {
      log("Function started");

      const { userId, email } = await authenticateUser(req);
      if (!email) throw new Error("User email not available");
      log("User authenticated", { userId, email });

      const body = await req.json();
      const packageType = body[packageKey];
      
      const selectedPackage = config.packages[packageType];
      if (!selectedPackage) {
        const validPackages = Object.keys(config.packages).join(", ");
        throw new Error(`Invalid ${packageKey}: ${packageType}. Valid options: ${validPackages}`);
      }

      log("Selected package", { packageType, credits: selectedPackage.credits });

      const stripe = createStripeClient();
      const customerId = await getStripeCustomer(stripe, email);

      const origin = req.headers.get("origin") || "";

      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : email,
        line_items: [{ price: selectedPackage.price, quantity: 1 }],
        mode: "payment",
        success_url: `${origin}${config.successPath}`,
        cancel_url: `${origin}${config.cancelPath}`,
        metadata: {
          user_id: userId,
          package_type: packageType,
          credits: selectedPackage.credits.toString(),
          type: config.metadataType,
        },
      });

      log("Checkout session created", { sessionId: session.id, packageType });
      return successResponse({ url: session.url, session_id: session.id });
    } catch (error) {
      log("ERROR", { message: error instanceof Error ? error.message : String(error) });
      return errorResponse(error);
    }
  };
}
