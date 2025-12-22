import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-FUTURE-FACE-SUBSCRIPTION] ${step}${detailsStr}`);
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

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Find customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      logStep("No customer found");
      return new Response(JSON.stringify({
        hasBasic: false,
        hasPremium: false,
        hasFamily: false,
        hasCorporate: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for one-time payments (Basic and Premium)
    const checkoutSessions = await stripe.checkout.sessions.list({
      customer: customerId,
      limit: 100,
    });

    let hasBasic = false;
    let hasPremium = false;

    for (const session of checkoutSessions.data) {
      if (session.payment_status === 'paid' && session.metadata?.plan_type) {
        if (session.metadata.plan_type === 'basic') hasBasic = true;
        if (session.metadata.plan_type === 'premium') hasPremium = true;
      }
    }

    logStep("Checked one-time payments", { hasBasic, hasPremium });

    // Check for active subscriptions (Family and Corporate)
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    });

    let hasFamily = false;
    let hasCorporate = false;

    for (const subscription of subscriptions.data) {
      const metadata = subscription.metadata;
      if (metadata?.plan_type === 'family') hasFamily = true;
      if (metadata?.plan_type === 'corporate') hasCorporate = true;
    }

    logStep("Checked subscriptions", { hasFamily, hasCorporate });

    return new Response(JSON.stringify({
      hasBasic,
      hasPremium,
      hasFamily,
      hasCorporate
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
