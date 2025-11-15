import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TIPSTER_PRODUCT_ID = "prod_TQkgfkhRhpZSXw";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-TIPSTER-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found");
      return new Response(JSON.stringify({ 
        has_tipster_subscription: false,
        tipster_subscription_end: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 100,
    });

    // Find tipster subscription
    const tipsterSub = subscriptions.data.find((sub: any) => 
      sub.items.data.some((item: any) => item.price.product === TIPSTER_PRODUCT_ID)
    );

    if (tipsterSub) {
      const subscriptionEnd = new Date(tipsterSub.current_period_end * 1000).toISOString();
      logStep("Active tipster subscription found", { 
        subscriptionId: tipsterSub.id, 
        endDate: subscriptionEnd 
      });

      // Update or create tipster record if subscription is active
      const { data: existingTipster } = await supabaseClient
        .from("sports_tipsters")
        .select("id, status")
        .eq("user_id", user.id)
        .single();

      if (existingTipster && existingTipster.status === "pending") {
        // Activate pending tipster
        await supabaseClient
          .from("sports_tipsters")
          .update({ 
            status: "active",
            subscription_end: subscriptionEnd
          })
          .eq("user_id", user.id);
        logStep("Activated pending tipster");
      }

      return new Response(JSON.stringify({
        has_tipster_subscription: true,
        tipster_subscription_end: subscriptionEnd
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("No active tipster subscription found");
    return new Response(JSON.stringify({ 
      has_tipster_subscription: false,
      tipster_subscription_end: null 
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
