import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-WELLNESS-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, returning unsubscribed state");
      return new Response(JSON.stringify({ 
        subscribed: false,
        tier: null,
        subscription_end: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

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

    // Wellness product IDs
    const wellnessProducts = {
      basicMonthly: "prod_TNALdOZ4pthZnd",
      premiumMonthly: "prod_TNAMLqWEGvN9tJ",
      basicLifetime: "prod_TNANc4Yy4ZJ5Tq",
      premiumLifetime: "prod_TNANi5KMiaZSnI",
    };

    // Check active subscriptions first
    for (const subscription of subscriptions.data) {
      const productId = subscription.items.data[0].price.product as string;
      
      if (productId === wellnessProducts.premiumMonthly) {
        tier = "premium";
        subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
        logStep("Active Premium Monthly subscription found", { subscriptionId: subscription.id });
        break;
      } else if (productId === wellnessProducts.basicMonthly) {
        tier = "basic";
        subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
        logStep("Active Basic Monthly subscription found", { subscriptionId: subscription.id });
        break;
      }
    }

    // Check for lifetime purchases
    if (!tier) {
      for (const session of sessions.data) {
        if (session.payment_status === "paid" && session.mode === "payment") {
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
          
          for (const item of lineItems.data) {
            const productId = typeof item.price?.product === 'string' ? item.price.product : null;
            
            if (productId === wellnessProducts.premiumLifetime) {
              tier = "premium";
              isLifetime = true;
              logStep("Premium Lifetime purchase found", { sessionId: session.id });
              break;
            } else if (productId === wellnessProducts.basicLifetime) {
              tier = "basic";
              isLifetime = true;
              logStep("Basic Lifetime purchase found", { sessionId: session.id });
              break;
            }
          }
          
          if (tier) break;
        }
      }
    }

    const hasAccess = !!tier;
    logStep("Final access status", { hasAccess, tier, isLifetime });

    return new Response(JSON.stringify({
      subscribed: hasAccess,
      tier,
      subscription_end: subscriptionEnd,
      is_lifetime: isLifetime
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-wellness-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
