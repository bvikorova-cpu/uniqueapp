// Shared one-off Stripe checkout helpers used by both:
//   - the universal create-one-off-payment router
//   - legacy wrapper functions that still need pre/post DB side-effects
//
// Centralizing the PRODUCTS catalog + session builder keeps every entry
// (priceId, default amount, success/cancel paths) in ONE place.

import Stripe from "https://esm.sh/stripe@18.5.0";

export type ProductDef = {
  /** Stripe price_id when the product has a fixed price */
  priceId?: string;
  /** Fallback amount in minor units (cents) when no priceId */
  amount?: number;
  currency?: string;
  /** Display name for dynamic price_data */
  name?: string;
  description?: string;
  successPath: string;
  cancelPath: string;
  /** Default true — set false for guest-allowed flows (e.g. tip jar) */
  requireAuth?: boolean;
};

/**
 * Central catalog of one-off payments.
 * Add new entries here when you onboard a new module.
 *
 * NOTE: subscriptions (coffee_lover, decor_pro, etc.) live in the
 * Phase-3 `create-checkout` router, NOT here.
 */
export const PRODUCTS: Record<string, ProductDef> = {
  // === Jobs (Phase 4 part 1) ===
  job_listing_7: {
    priceId: "price_1TOyIhGaXSfGtYFt2CrL50T6",
    successPath: "/jobs/post/success",
    cancelPath: "/jobs/post",
  },
  job_listing_14: {
    priceId: "price_1TOyIjGaXSfGtYFtsiK8FRRx",
    successPath: "/jobs/post/success",
    cancelPath: "/jobs/post",
  },
  job_listing_30: {
    priceId: "price_1TOyIkGaXSfGtYFtSVA63POC",
    successPath: "/jobs/post/success",
    cancelPath: "/jobs/post",
  },
  job_listing_featured: {
    priceId: "price_1TOyIkGaXSfGtYFtBNKAmNFk",
    successPath: "/jobs/post/success",
    cancelPath: "/jobs/post",
  },

  // === Coffee / tip jar (dynamic amount; no auth required) ===
  coffee_small: {
    amount: 300,
    currency: "eur",
    name: "Buy a Coffee – Small",
    successPath: "/?coffee=success",
    cancelPath: "/?coffee=cancel",
    requireAuth: false,
  },
  coffee_medium: {
    amount: 500,
    currency: "eur",
    name: "Buy a Coffee – Medium",
    successPath: "/?coffee=success",
    cancelPath: "/?coffee=cancel",
    requireAuth: false,
  },
  coffee_large: {
    amount: 1000,
    currency: "eur",
    name: "Buy a Coffee – Large",
    successPath: "/?coffee=success",
    cancelPath: "/?coffee=cancel",
    requireAuth: false,
  },

  // === AR Preview ===
  ar_preview: {
    amount: 199,
    currency: "eur",
    name: "AR Preview",
    successPath: "/home-decor",
    cancelPath: "/home-decor",
  },

  // === Concert: song requests + collectible tickets (dynamic amount) ===
  concert_song_request: {
    currency: "eur",
    name: "Song Request",
    successPath: "/live-concerts",
    cancelPath: "/live-concerts",
  },
  concert_collectible_ticket: {
    currency: "eur",
    name: "Collectible Ticket",
    successPath: "/live-concerts",
    cancelPath: "/live-concerts",
  },
  concert_ticket: {
    currency: "eur",
    name: "Concert Ticket",
    successPath: "/live-concerts",
    cancelPath: "/live-concerts",
  },

  // === Crystal marketplace ===
  crystal_purchase: {
    currency: "eur",
    name: "Crystal Item",
    successPath: "/crystal-marketplace",
    cancelPath: "/crystal-marketplace",
  },

  // === Platform virtual gift (creator hub) ===
  platform_gift: {
    currency: "eur",
    name: "Virtual Gift",
    successPath: "/",
    cancelPath: "/",
  },

  // === Influencer / MasterChef / Live-stream gifts ===
  influencer_gift: {
    currency: "eur",
    name: "Influencer Gift",
    successPath: "/influ-king",
    cancelPath: "/influ-king",
  },
  masterchef_gift: {
    currency: "eur",
    name: "MasterChef Gift",
    successPath: "/masterchef/dashboard",
    cancelPath: "/masterchef/dashboard",
  },
  stream_gift: {
    currency: "eur",
    name: "Stream Gift",
    successPath: "/live-stream",
    cancelPath: "/live-stream",
  },

  // === Course purchase (one-off lifetime access) ===
  course_purchase: {
    currency: "eur",
    name: "Course Purchase",
    successPath: "/course",
    cancelPath: "/course",
  },

  // === Rewards: cosmetic items (avatar frames, themes, borders, name colors) ===
  cosmetic_purchase: {
    currency: "eur",
    name: "Cosmetic Item",
    successPath: "/rewards",
    cancelPath: "/rewards",
  },

  // === Skills Marketplace: one-off service order (dynamic amount) ===
  skill_service_order: {
    currency: "eur",
    name: "Skills Marketplace Order",
    successPath: "/skills-marketplace/orders/success",
    cancelPath: "/skills-marketplace/orders",
  },
};

export function getStripe(): Stripe {
  return new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });
}

export async function getOrFindCustomer(
  stripe: Stripe,
  email?: string,
): Promise<string | undefined> {
  if (!email) return undefined;
  const customers = await stripe.customers.list({ email, limit: 1 });
  return customers.data[0]?.id;
}

export type BuildSessionInput = {
  productKey: string;
  /** Override the default amount (cents) for dynamic products */
  amount?: number;
  /** Override the default name for dynamic products */
  name?: string;
  description?: string;
  /** Image URLs forwarded to Stripe product_data */
  images?: string[];
  metadata?: Record<string, string>;
  /** Authenticated user info (optional) */
  userId?: string;
  userEmail?: string;
  /** Origin used for success/cancel URLs */
  origin: string;
  /** Override successPath (e.g. include query params) */
  successPath?: string;
  /** Override cancelPath */
  cancelPath?: string;
};

/**
 * Builds and creates a Stripe Checkout Session for a one-off product.
 * Throws on unknown productKey or auth violation.
 */
export async function createOneOffSession(
  input: BuildSessionInput,
): Promise<{ url: string | null; sessionId: string }> {
  const product = PRODUCTS[input.productKey];
  if (!product) throw new Error(`Unknown productKey: ${input.productKey}`);

  if (product.requireAuth !== false && !input.userEmail) {
    throw new Error("Authentication required for this product");
  }

  const stripe = getStripe();
  const customerId = await getOrFindCustomer(stripe, input.userEmail);

  const lineItem = product.priceId
    ? { price: product.priceId, quantity: 1 }
    : {
        quantity: 1,
        price_data: {
          currency: product.currency || "eur",
          unit_amount: input.amount ?? product.amount ?? 100,
          product_data: {
            name: input.name || product.name || input.productKey,
            description: input.description || product.description,
            images: input.images?.length ? input.images : undefined,
          },
        },
      };

  const successPath = input.successPath || product.successPath;
  const cancelPath = input.cancelPath || product.cancelPath;
  const successUrl = `${input.origin}${successPath}${
    successPath.includes("?") ? "&" : "?"
  }session_id={CHECKOUT_SESSION_ID}`;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    customer_email: customerId ? undefined : input.userEmail,
    line_items: [lineItem as any],
    mode: "payment",
    success_url: successUrl,
    cancel_url: `${input.origin}${cancelPath}`,
    metadata: {
      productKey: input.productKey,
      userId: input.userId ?? "",
      ...(input.metadata || {}),
    },
    client_reference_id: input.userId,
  });

  return { url: session.url, sessionId: session.id };
}
