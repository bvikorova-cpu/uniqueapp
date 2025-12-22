import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { authenticateUser } from "../_shared/supabaseClient.ts";
import { createStripeClient } from "../_shared/stripe.ts";
import { createLogger } from "../_shared/logger.ts";

const log = createLogger("check-future-face-subscription");

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
        hasBasic: false, hasPremium: false, hasFamily: false, hasCorporate: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = customers.data[0].id;

    // Check one-time payments (Basic and Premium)
    const checkoutSessions = await stripe.checkout.sessions.list({
      customer: customerId, limit: 100,
    });

    let hasBasic = false, hasPremium = false;
    for (const session of checkoutSessions.data) {
      if (session.payment_status === 'paid' && session.metadata?.plan_type) {
        if (session.metadata.plan_type === 'basic') hasBasic = true;
        if (session.metadata.plan_type === 'premium') hasPremium = true;
      }
    }

    // Check subscriptions (Family and Corporate)
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId, status: "active", limit: 10,
    });

    let hasFamily = false, hasCorporate = false;
    for (const sub of subscriptions.data) {
      if (sub.metadata?.plan_type === 'family') hasFamily = true;
      if (sub.metadata?.plan_type === 'corporate') hasCorporate = true;
    }

    return new Response(JSON.stringify({
      hasBasic, hasPremium, hasFamily, hasCorporate
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
