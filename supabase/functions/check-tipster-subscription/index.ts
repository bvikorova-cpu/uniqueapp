import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { authenticateUser, createSupabaseAdminClient } from "../_shared/supabaseClient.ts";
import { createStripeClient, hasActiveSubscription } from "../_shared/stripe.ts";
import { createLogger } from "../_shared/logger.ts";

const log = createLogger("check-tipster-subscription");
const TIPSTER_PRODUCT_ID = "prod_TQkgfkhRhpZSXw";

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

    const subResult = await hasActiveSubscription(stripe, user.email!, [TIPSTER_PRODUCT_ID]);

    if (subResult.hasSubscription && subResult.subscriptionEnd) {
      // Update or activate pending tipster
      const { data: existingTipster } = await supabase
        .from("sports_tipsters")
        .select("id, status")
        .eq("user_id", userId)
        .single();

      if (existingTipster?.status === "pending") {
        await supabase
          .from("sports_tipsters")
          .update({ status: "active", subscription_end: subResult.subscriptionEnd })
          .eq("user_id", userId);
        log("Activated pending tipster");
      }
    }

    return new Response(JSON.stringify({
      has_tipster_subscription: subResult.hasSubscription,
      tipster_subscription_end: subResult.subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: errorMessage });
    const status = /authoriz|authentic|missing sub|invalid claim|bearer/i.test(errorMessage) ? 401 : 500;
    return new Response(JSON.stringify({ error: status === 401 ? "Unauthorized" : errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status,
    });
  }
});
