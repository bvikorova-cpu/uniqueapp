import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { authenticateUser } from "../_shared/supabaseClient.ts";
import { createStripeClient, getOrCreateStripeCustomer, safeParseStripeDate } from "../_shared/stripe.ts";
import { createLogger } from "../_shared/logger.ts";

const log = createLogger("check-lottery-subscription");
const LOTTERY_PRODUCTS = {
  basic: "prod_TQinlyjGo50cTk",
  pro: "prod_TQinw9pUYC81T8"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("Function started");
    const { user, userId } = await authenticateUser(req);
    log("User authenticated", { userId, email: user.email });

    const stripe = createStripeClient();
    const customerId = await getOrCreateStripeCustomer(stripe, user.email!, userId);

    if (!customerId) {
      return new Response(JSON.stringify({
        subscribed: false, isBasic: false, isPro: false,
        subscription_end: null, product_id: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    });

    let isBasic = false, isPro = false, subscriptionEnd = null, productId = null;

    for (const sub of subscriptions.data) {
      const subProductId = sub.items.data[0].price.product as string;
      subscriptionEnd = safeParseStripeDate((sub as any).current_period_end);
      
      if (subProductId === LOTTERY_PRODUCTS.basic) {
        isBasic = true;
        productId = subProductId;
      } else if (subProductId === LOTTERY_PRODUCTS.pro) {
        isPro = true;
        productId = subProductId;
      }
    }

    return new Response(JSON.stringify({
      subscribed: isBasic || isPro,
      isBasic, isPro,
      subscription_end: subscriptionEnd,
      product_id: productId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
