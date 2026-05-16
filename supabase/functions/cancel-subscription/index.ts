import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CANCEL-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { subscriptionType } = await req.json();
    if (!subscriptionType) throw new Error("Subscription type is required");
    logStep("Subscription type", { subscriptionType });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Find customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      throw new Error("No Stripe customer found for this user");
    }
    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Find active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 100,
    });

    if (subscriptions.data.length === 0) {
      throw new Error("No active subscription found");
    }
    logStep("Found active subscriptions", { count: subscriptions.data.length });

    // Find the right subscription based on type
    let subscriptionToCancel = subscriptions.data[0];
    
    // Cancel the subscription at period end (no refund)
    const canceledSubscription = await stripe.subscriptions.update(subscriptionToCancel.id, {
      cancel_at_period_end: true,
    });
    logStep("Subscription canceled at period end", { 
      subscriptionId: canceledSubscription.id,
      cancelAt: new Date(canceledSubscription.current_period_end * 1000).toISOString()
    });

    // Update database based on subscription type
    if (subscriptionType === 'dating') {
      await supabaseClient
        .from("dating_subscriptions")
        .update({ 
          status: 'canceling',
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id)
        .eq("status", "active");
      logStep("Updated dating_subscriptions table");
    } else if (subscriptionType === 'megatalent') {
      await supabaseClient
        .from("megatalent_subscriptions")
        .update({ 
          status: 'canceling',
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id)
        .eq("status", "active");
      logStep("Updated megatalent_subscriptions table");
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: "Subscription will be canceled at the end of the current period",
      cancelAt: new Date(canceledSubscription.current_period_end * 1000).toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in cancel-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});