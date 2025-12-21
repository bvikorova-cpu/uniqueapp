import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUBSCRIPTION_TIERS = {
  "price_1SQ5bv0QTWhd4oRpEQwOsKMQ": "basic",  // Basic tier
  "price_1SQ5cIGaXSfGtYFtKghPwnpp": "pro",    // Pro tier
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { 
        auth: { persistSession: false },
        global: { headers: { Authorization: authHeader } }
      }
    );

    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    if (userError) throw userError;
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      // No Stripe customer - no subscription
      return new Response(
        JSON.stringify({ 
          subscribed: false,
          tier: null,
          limit: 0,
          generations_used: 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      // No active subscription
      return new Response(
        JSON.stringify({ 
          subscribed: false,
          tier: null,
          limit: 0,
          generations_used: 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0].price.id;
    const tier = SUBSCRIPTION_TIERS[priceId as keyof typeof SUBSCRIPTION_TIERS] || null;
    
    // Get user subscription data from database
    const { data: userSubData } = await supabaseClient
      .from("user_subscriptions")
      .select("generations_used, generations_limit")
      .eq("user_id", user.id)
      .maybeSingle();

    const generationsUsed = userSubData?.generations_used || 0;
    const generationsLimit = tier === "pro" ? -1 : (userSubData?.generations_limit || 10);

    return new Response(
      JSON.stringify({
        subscribed: true,
        tier: tier,
        limit: generationsLimit,
        generations_used: generationsUsed,
        subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Check subscription error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
