import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { authenticateUser, createSupabaseAdminClient } from "../_shared/supabaseClient.ts";
import { createStripeClient, hasActiveSubscription } from "../_shared/stripe.ts";
import { createLogger } from "../_shared/logger.ts";

const log = createLogger("check-employer-subscription");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("Function started");
    const { user, userId } = await authenticateUser(req);
    log("User authenticated", { userId, email: user.email });

    const supabase = createSupabaseAdminClient();

    // Check if user is employer
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'employer')
      .maybeSingle();

    if (!roleData) {
      log("User is not an employer");
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = createStripeClient();
    
    // Get Stripe customer ID first (hasActiveSubscription expects customerId, not email)
    const { getStripeCustomer } = await import("../_shared/stripe.ts");
    const customerId = await getStripeCustomer(stripe, user.email!);
    
    if (!customerId) {
      log("No Stripe customer found");
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const subResult = await hasActiveSubscription(stripe, customerId);

    return new Response(JSON.stringify({
      subscribed: subResult.hasSubscription,
      product_id: subResult.productId,
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
