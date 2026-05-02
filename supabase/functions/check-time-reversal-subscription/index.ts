import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { authenticateUser } from "../_shared/supabaseClient.ts";
import { createStripeClient, safeParseStripeDate } from "../_shared/stripe.ts";
import { createLogger } from "../_shared/logger.ts";

const log = createLogger("check-time-reversal-subscription");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("Function started");
    const { user, userId } = await authenticateUser(req);
    log("User authenticated", { userId, email: user.email });

    const stripe = createStripeClient();
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 });

    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ 
        subscribed: false, activeFeatures: []
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId, status: "active",
    });

    const activeFeatures: string[] = [];
    let subscriptionEnd: string | null = null;

    for (const sub of subscriptions.data) {
      const productId = sub.items.data[0].price.product as string;
      activeFeatures.push(productId);
      const subEnd = safeParseStripeDate((sub as any).current_period_end);
      if (subEnd && (!subscriptionEnd || subEnd > subscriptionEnd)) {
        subscriptionEnd = subEnd;
      }
    }

    return new Response(JSON.stringify({
      subscribed: activeFeatures.length > 0,
      activeFeatures,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: errorMessage });
    const status = /unauth|jwt|token|missing auth|claim|sub claim/i.test(errorMessage) ? 401 : 500;
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status,
    });
  }
});
