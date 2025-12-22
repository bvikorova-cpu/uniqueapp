import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { authenticateUser, createSupabaseAdminClient } from "../_shared/supabaseClient.ts";
import { createStripeClient, hasActiveSubscription } from "../_shared/stripe.ts";
import { createLogger } from "../_shared/logger.ts";

const log = createLogger("check-vip-subscription");
const VIP_PRODUCT_ID = 'prod_TJOK0yvBxNalLl';

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("Function started");
    const { user, userId } = await authenticateUser(req);
    log("User authenticated", { userId, email: user.email });

    const stripe = createStripeClient();
    const supabase = createSupabaseAdminClient();

    const subResult = await hasActiveSubscription(stripe, user.email!, [VIP_PRODUCT_ID]);

    if (subResult.hasSubscription && subResult.subscriptionEnd) {
      await supabase
        .from('vip_subscriptions')
        .upsert({
          user_id: userId,
          stripe_subscription_id: subResult.subscription?.id,
          status: 'active',
          current_period_end: subResult.subscriptionEnd,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
    }

    return new Response(JSON.stringify({
      subscribed: subResult.hasSubscription,
      is_vip: subResult.hasSubscription,
      subscription_end: subResult.subscriptionEnd
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
