import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-READING-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
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

    // Check or create usage record
    let { data: usageData, error: usageError } = await supabaseClient
      .from('kids_reading_usage')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (usageError && usageError.code === 'PGRST116') {
      // No record exists, create one with free tier limits (1 per month)
      const { data: newUsage, error: insertError } = await supabaseClient
        .from('kids_reading_usage')
        .insert({
          user_id: user.id,
          analyses_used: 0,
          analyses_limit: 1, // 1 free per month
          quizzes_used: 0,
          quizzes_limit: 1, // 1 free per month
          subscription_start: null,
          subscription_end: null
        })
        .select()
        .single();

      if (insertError) throw insertError;
      usageData = newUsage;
      logStep("Created new usage record with free tier limits (1 per month)");
    } else if (usageError) {
      throw usageError;
    }

    logStep("Usage data retrieved", usageData);

    // Check Stripe for active subscription
    let hasActiveSub = false;
    let productId = null;

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length > 0) {
      const customerId = customers.data[0].id;
      logStep("Found Stripe customer", { customerId });

      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });
      
      hasActiveSub = subscriptions.data.length > 0;

      if (hasActiveSub) {
        const subscription = subscriptions.data[0];
        const subscriptionEndDate = new Date(subscription.current_period_end * 1000).toISOString().split('T')[0];
        productId = subscription.items.data[0].price.product as string;
        
        logStep("Active Stripe subscription found", { subscriptionId: subscription.id, endDate: subscriptionEndDate });

        // Update usage record with unlimited limits
        await supabaseClient
          .from('kids_reading_usage')
          .update({
            analyses_limit: 999999,
            quizzes_limit: 999999,
            subscription_end: subscriptionEndDate
          })
          .eq('user_id', user.id);

        // Update local data to reflect changes
        usageData.analyses_limit = 999999;
        usageData.quizzes_limit = 999999;
        usageData.subscription_end = subscriptionEndDate;

        logStep("Updated usage limits to unlimited");
      } else {
        // No active subscription, ensure limits are set to free tier
        logStep("No active subscription, setting free tier limits");
        await supabaseClient
          .from('kids_reading_usage')
          .update({
            analyses_limit: 1,
            quizzes_limit: 1,
            subscription_start: null,
            subscription_end: null
          })
          .eq('user_id', user.id);

        // Update local data to reflect changes
        usageData.analyses_limit = 1;
        usageData.quizzes_limit = 1;
        usageData.subscription_end = null;
      }
    } else {
      logStep("No Stripe customer found");
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      product_id: productId,
      subscription_end: usageData.subscription_end,
      analyses_used: usageData.analyses_used,
      analyses_limit: usageData.analyses_limit,
      quizzes_used: usageData.quizzes_used,
      quizzes_limit: usageData.quizzes_limit
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-reading-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
