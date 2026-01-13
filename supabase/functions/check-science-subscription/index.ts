import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { authenticateUser, createSupabaseAdminClient } from "../_shared/supabaseClient.ts";
import { createStripeClient, getStripeCustomer, hasActiveSubscription } from "../_shared/stripe.ts";
import { createLogger } from "../_shared/logger.ts";

const log = createLogger("check-science-subscription");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("Function started");
    const { user, userId } = await authenticateUser(req);
    log("User authenticated", { userId, email: user.email });

    const supabase = createSupabaseAdminClient();
    const today = new Date().toISOString().split('T')[0];

    // Initialize or get usage record with monthly reset
    const { data: usageData, error: usageError } = await supabase
      .from('kids_science_usage')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (usageError && usageError.code !== 'PGRST116') {
      throw usageError;
    }

    if (!usageData || (usageData.last_reset_date && 
        new Date(usageData.last_reset_date).getMonth() !== new Date().getMonth())) {
      await supabase.from('kids_science_usage').upsert({
        user_id: userId,
        experiments_this_month: usageData ? 0 : 0,
        last_reset_date: today
      }, { onConflict: 'user_id' });
    }

    const stripe = createStripeClient();
    
    // First find customer by email - don't error if not found
    const customerId = await getStripeCustomer(stripe, user.email!);
    
    // If no customer exists, user has no subscription
    const subResult = customerId 
      ? await hasActiveSubscription(stripe, customerId)
      : { hasSubscription: false, productId: null, subscriptionEnd: null };

    // Update subscription status in DB
    await supabase.from('kids_science_usage').upsert({
      user_id: userId,
      subscription_status: subResult.hasSubscription ? 'premium' : 'free',
      product_id: subResult.productId,
      subscription_end: subResult.subscriptionEnd,
      last_reset_date: today
    }, { onConflict: 'user_id' });

    // Get final usage
    const { data: finalUsage } = await supabase
      .from('kids_science_usage')
      .select('experiments_this_month')
      .eq('user_id', userId)
      .single();

    return new Response(JSON.stringify({
      subscribed: subResult.hasSubscription,
      product_id: subResult.productId,
      subscription_end: subResult.subscriptionEnd,
      experiments_used: finalUsage?.experiments_this_month || 0,
      experiments_limit: subResult.hasSubscription ? -1 : 1
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
