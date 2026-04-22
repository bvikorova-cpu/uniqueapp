// Universal one-off Stripe checkout router
// Usage from client:
//   supabase.functions.invoke('create-one-off-payment', {
//     body: { productKey: 'job_listing_7', metadata: { jobListingId: '...' } }
//   })
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type ProductDef = {
  priceId?: string;
  amount?: number; // cents, fallback when no priceId
  currency?: string;
  name?: string;
  description?: string;
  successPath: string;
  cancelPath: string;
  requireAuth?: boolean; // default true
};

// Central catalog of one-off payments. Add new entries here when you onboard a new module.
const PRODUCTS: Record<string, ProductDef> = {
  // === Jobs ===
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

  // === Coffee / Tip-jar (dynamic amount supported via amount in body) ===
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

  // === Concert ticket (price set dynamically by caller) ===
  concert_ticket: {
    currency: "eur",
    name: "Concert Ticket",
    successPath: "/concerts/success",
    cancelPath: "/concerts",
  },

  // === AR Preview ===
  ar_preview: {
    amount: 199,
    currency: "eur",
    name: "AR Preview",
    successPath: "/decor?ar=success",
    cancelPath: "/decor",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { productKey, amount: customAmount, name: customName, metadata = {} } = body;

    const product = PRODUCTS[productKey];
    if (!product) {
      return new Response(
        JSON.stringify({ error: `Unknown productKey: ${productKey}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Optional auth
    let userEmail: string | undefined;
    let userId: string | undefined;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabase.auth.getUser(token);
      userEmail = data.user?.email ?? undefined;
      userId = data.user?.id;
    }

    if (product.requireAuth !== false && !userEmail) {
      return new Response(
        JSON.stringify({ error: "Authentication required for this product" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Re-use existing customer if any
    let customerId: string | undefined;
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) customerId = customers.data[0].id;
    }

    // Build line item: priceId or dynamic price_data
    const lineItem = product.priceId
      ? { price: product.priceId, quantity: 1 }
      : {
          quantity: 1,
          price_data: {
            currency: product.currency || "eur",
            unit_amount: customAmount ?? product.amount ?? 100,
            product_data: {
              name: customName || product.name || productKey,
              description: product.description,
            },
          },
        };

    const origin = req.headers.get("origin") || "https://uniqueapp.fun";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [lineItem as any],
      mode: "payment",
      success_url: `${origin}${product.successPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${product.cancelPath}`,
      metadata: {
        productKey,
        userId: userId ?? "",
        ...metadata,
      },
    });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("create-one-off-payment error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
