import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { authenticateUser } from "../_shared/supabaseClient.ts";
import { createStripeClient } from "../_shared/stripe.ts";
import { createLogger } from "../_shared/logger.ts";

const log = createLogger("check-wellness-subscription");

// Wellness product IDs
const WELLNESS_PRODUCTS = {
  basicMonthly: "prod_TNALdOZ4pthZnd",
  premiumMonthly: "prod_TNAMLqWEGvN9tJ",
  basicLifetime: "prod_TNANc4Yy4ZJ5Tq",
  premiumLifetime: "prod_TNANi5KMiaZSnI",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("Function started");
    const { user } = await authenticateUser(req);
    log("User authenticated", { userId: user.id });

    const stripe = createStripeClient();
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
    
    if (customers.data.length === 0) {
      log("No customer found");
      return new Response(JSON.stringify({ 
        subscribed: false,
        tier: null,
        subscription_end: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = customers.data[0].id;
    log("Found customer", { customerId });

    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    });

    // Check for one-time payments (completed checkout sessions)
    const sessions = await stripe.checkout.sessions.list({
      customer: customerId,
      limit: 20,
    });

    let tier = null;
    let subscriptionEnd = null;
    let isLifetime = false;

    // Check active subscriptions first
    for (const subscription of subscriptions.data) {
      const productId = subscription.items.data[0].price.product as string;
      
      if (productId === WELLNESS_PRODUCTS.premiumMonthly) {
        tier = "premium";
        subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
        log("Active Premium Monthly found");
        break;
      } else if (productId === WELLNESS_PRODUCTS.basicMonthly) {
        tier = "basic";
        subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
        log("Active Basic Monthly found");
        break;
      }
    }

    // Check for lifetime purchases
    if (!tier) {
      for (const session of sessions.data) {
        if (session.payment_status === "paid" && session.mode === "payment") {
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
          
          for (const item of lineItems.data) {
            const productId = typeof item.price?.product === "string" ? item.price.product : null;
            
            if (productId === WELLNESS_PRODUCTS.premiumLifetime) {
              tier = "premium";
              isLifetime = true;
              log("Premium Lifetime found");
              break;
            } else if (productId === WELLNESS_PRODUCTS.basicLifetime) {
              tier = "basic";
              isLifetime = true;
              log("Basic Lifetime found");
              break;
            }
          }
          
          if (tier) break;
        }
      }
    }

    const hasAccess = !!tier;
    log("Final status", { hasAccess, tier, isLifetime });

    return new Response(JSON.stringify({
      subscribed: hasAccess,
      tier,
      subscription_end: subscriptionEnd,
      is_lifetime: isLifetime
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
