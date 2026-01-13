import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { authenticateUser, createSupabaseAdminClient } from "../_shared/supabaseClient.ts";
import { createStripeClient, getStripeCustomer, hasActiveSubscription } from "../_shared/stripe.ts";
import { createLogger } from "../_shared/logger.ts";

const log = createLogger("check-kids-drawing-subscription");

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
    const { data: usage, error: usageError } = await supabase
      .from("kids_drawing_usage")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (usageError && usageError.code !== "PGRST116") {
      throw usageError;
    }

    if (!usage) {
      await supabase.from("kids_drawing_usage").insert({
        user_id: userId, tutorials_used: 0, tutorials_limit: 1,
      });
    }

    const stripe = createStripeClient();
    
    // First find customer by email - don't error if not found
    const customerId = await getStripeCustomer(stripe, user.email!);
    
    // If no customer exists, user has no subscription
    const subResult = customerId 
      ? await hasActiveSubscription(stripe, customerId)
      : { hasSubscription: false, productId: null, subscriptionEnd: null };

    if (subResult.hasSubscription) {
      await supabase
        .from("kids_drawing_usage")
        .update({ tutorials_limit: 999999 })
        .eq("user_id", userId);

      return new Response(JSON.stringify({
        subscribed: true,
        subscription_end: subResult.subscriptionEnd,
        tutorials_used: usage?.tutorials_used || 0,
        tutorials_limit: 999999
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ 
      subscribed: false,
      tutorials_used: usage?.tutorials_used || 0,
      tutorials_limit: usage?.tutorials_limit || 1
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
