import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { authenticateUser, createSupabaseAdminClient } from "../_shared/supabaseClient.ts";
import { createStripeClient, hasActiveSubscription, getStripeCustomer } from "../_shared/stripe.ts";
import { createLogger } from "../_shared/logger.ts";

const log = createLogger("check-kids-reading-subscription");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("Function started");
    const { user, userId } = await authenticateUser(req);
    log("User authenticated", { userId, email: user.email });

    const supabase = createSupabaseAdminClient();

    // Check or create usage record
    let { data: usageData, error: usageError } = await supabase
      .from('kids_reading_usage')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (usageError && usageError.code === 'PGRST116') {
      const { data: newUsage, error: insertError } = await supabase
        .from('kids_reading_usage')
        .insert({
          user_id: userId,
          analyses_used: 0, analyses_limit: 1,
          quizzes_used: 0, quizzes_limit: 1,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      usageData = newUsage;
    } else if (usageError) {
      throw usageError;
    }

    const stripe = createStripeClient();
    
    // First get Stripe customer ID, then check subscription
    const customerId = await getStripeCustomer(stripe, user.email!);
    const subResult = customerId 
      ? await hasActiveSubscription(stripe, customerId)
      : { hasSubscription: false, subscription: null, priceId: null, productId: null, subscriptionEnd: null };

    if (subResult.hasSubscription && subResult.subscriptionEnd) {
      const subscriptionEndDate = subResult.subscriptionEnd.split('T')[0];
      await supabase
        .from('kids_reading_usage')
        .update({
          analyses_limit: 999999, quizzes_limit: 999999,
          subscription_end: subscriptionEndDate
        })
        .eq('user_id', userId);

      usageData.analyses_limit = 999999;
      usageData.quizzes_limit = 999999;
      usageData.subscription_end = subscriptionEndDate;
    } else {
      await supabase
        .from('kids_reading_usage')
        .update({
          analyses_limit: 1, quizzes_limit: 1,
          subscription_start: null, subscription_end: null
        })
        .eq('user_id', userId);

      usageData.analyses_limit = 1;
      usageData.quizzes_limit = 1;
      usageData.subscription_end = null;
    }

    return new Response(JSON.stringify({
      subscribed: subResult.hasSubscription,
      product_id: subResult.productId,
      subscription_end: usageData.subscription_end,
      analyses_used: usageData.analyses_used,
      analyses_limit: usageData.analyses_limit,
      quizzes_used: usageData.quizzes_used,
      quizzes_limit: usageData.quizzes_limit
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
