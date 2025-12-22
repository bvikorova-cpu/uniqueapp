import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-LOTTERY-SUBSCRIPTION] ${step}${detailsStr}`);
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

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Find customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      logStep("No customer found");
      return new Response(JSON.stringify({
        subscribed: false,
        isBasic: false,
        isPro: false,
        subscription_end: null,
        product_id: null
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

    let isBasic = false;
    let isPro = false;
    let subscriptionEnd = null;
    let productId = null;

    const LOTTERY_PRODUCTS = {
      basic: "prod_TQinlyjGo50cTk",
      pro: "prod_TQinw9pUYC81T8"
    };

    for (const subscription of subscriptions.data) {
      const subProductId = subscription.items.data[0].price.product as string;
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      
      if (subProductId === LOTTERY_PRODUCTS.basic) {
        isBasic = true;
        productId = subProductId;
        logStep("Found Basic subscription", { subscriptionId: subscription.id });
      } else if (subProductId === LOTTERY_PRODUCTS.pro) {
        isPro = true;
        productId = subProductId;
        logStep("Found Pro subscription", { subscriptionId: subscription.id });
      }
    }

    const subscribed = isBasic || isPro;
    logStep("Subscription check complete", { subscribed, isBasic, isPro });

    return new Response(JSON.stringify({
      subscribed,
      isBasic,
      isPro,
      subscription_end: subscriptionEnd,
      product_id: productId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
