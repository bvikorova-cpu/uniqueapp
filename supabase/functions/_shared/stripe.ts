import Stripe from "https://esm.sh/stripe@18.5.0";

const STRIPE_API_VERSION = "2025-08-27.basil";

/**
 * Safely parse a Stripe timestamp that may be a number (unix seconds) or a string (ISO date).
 * Stripe API version "basil" returns string dates instead of unix timestamps.
 */
export function safeParseStripeDate(value: unknown): string | null {
  if (!value) return null;
  try {
    if (typeof value === "number") {
      if (!Number.isFinite(value) || value <= 0) return null;
      // Unix seconds → ms
      return new Date(value * 1000).toISOString();
    }
    if (typeof value === "string") {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d.toISOString();
      // Maybe it's a stringified number
      const num = Number(value);
      if (Number.isFinite(num) && num > 0) return new Date(num * 1000).toISOString();
    }
  } catch { /* swallow */ }
  return null;
}

/**
 * Creates and returns a configured Stripe instance
 */
export function createStripeClient(): Stripe {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  
  return new Stripe(stripeKey, {
    apiVersion: STRIPE_API_VERSION,
  });
}

/**
 * Gets or creates a Stripe customer by email
 * Returns existing customer ID or creates a new one
 */
export async function getOrCreateStripeCustomer(
  stripe: Stripe,
  email: string,
  userId?: string
): Promise<string> {
  const customers = await stripe.customers.list({ email, limit: 1 });
  
  if (customers.data.length > 0) {
    return customers.data[0].id;
  }
  
  const customer = await stripe.customers.create({
    email,
    metadata: userId ? { supabase_user_id: userId } : undefined,
  });
  
  return customer.id;
}

/**
 * Gets existing Stripe customer by email, returns null if not found
 */
export async function getStripeCustomer(
  stripe: Stripe,
  email: string
): Promise<string | null> {
  const customers = await stripe.customers.list({ email, limit: 1 });
  return customers.data.length > 0 ? customers.data[0].id : null;
}

// Alias for compatibility
export const findOrCreateCustomer = getStripeCustomer;

/**
 * Checks if customer has an active subscription for given price IDs
 */
export async function hasActiveSubscription(
  stripe: Stripe,
  customerId: string,
  priceIds?: string[]
): Promise<{
  hasSubscription: boolean;
  subscription: Stripe.Subscription | null;
  priceId: string | null;
  productId: string | null;
  subscriptionEnd: string | null;
}> {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 10,
  });

  if (subscriptions.data.length === 0) {
    return {
      hasSubscription: false,
      subscription: null,
      priceId: null,
      productId: null,
      subscriptionEnd: null,
    };
  }

  for (const subscription of subscriptions.data) {
    const currentPriceId = subscription.items.data[0].price.id;
    const currentProductId = subscription.items.data[0].price.product as string;
    
    // If no specific priceIds provided, return first active subscription
    if (!priceIds || priceIds.length === 0 || priceIds.includes(currentPriceId)) {
      return {
        hasSubscription: true,
        subscription,
        priceId: currentPriceId,
        productId: currentProductId,
        subscriptionEnd: safeParseStripeDate((subscription as any).current_period_end),
      };
    }
  }

  return {
    hasSubscription: false,
    subscription: null,
    priceId: null,
    productId: null,
    subscriptionEnd: null,
  };
}

/**
 * Checks for completed one-time payments
 */
export async function hasCompletedPayment(
  stripe: Stripe,
  customerId: string,
  productIds?: string[]
): Promise<{
  hasPurchase: boolean;
  productId: string | null;
  purchaseDate: string | null;
}> {
  const sessions = await stripe.checkout.sessions.list({
    customer: customerId,
    limit: 50,
  });

  for (const session of sessions.data) {
    if (session.payment_status === "paid" && session.mode === "payment") {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      
      for (const item of lineItems.data) {
        const productId = typeof item.price?.product === "string" ? item.price.product : null;
        
        if (productId) {
          if (!productIds || productIds.length === 0 || productIds.includes(productId)) {
            return {
              hasPurchase: true,
              productId,
              purchaseDate: safeParseStripeDate((session as any).created),
            };
          }
        }
      }
    }
  }

  return {
    hasPurchase: false,
    productId: null,
    purchaseDate: null,
  };
}
