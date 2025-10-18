import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRODUCT_IDS = {
  basic: "prod_basic_coloring", // Replace with actual Stripe product ID
  premium: "prod_premium_coloring", // Replace with actual Stripe product ID
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw userError;
    
    const user = userData.user;
    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    console.log("Checking subscription for user:", user.id);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      // No customer, ensure user has no credits
      await supabaseClient
        .from("coloring_credits")
        .upsert({
          user_id: user.id,
          credits_remaining: 0,
          tier: 'none'
        });

      return new Response(
        JSON.stringify({ 
          subscribed: false, 
          tier: 'none',
          credits_remaining: 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let tier = 'none';
    let creditsToAdd = 0;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      const productId = subscription.items.data[0].price.product as string;

      // Determine tier based on product ID
      if (productId === PRODUCT_IDS.basic) {
        tier = 'basic';
        creditsToAdd = 20; // 20 HD pages per month
      } else if (productId === PRODUCT_IDS.premium) {
        tier = 'premium';
        creditsToAdd = 999999; // Unlimited (represented as large number)
      }

      // Update credits
      await supabaseClient
        .from("coloring_credits")
        .upsert({
          user_id: user.id,
          credits_remaining: creditsToAdd,
          tier: tier,
          expires_at: subscriptionEnd
        });
    } else {
      await supabaseClient
        .from("coloring_credits")
        .upsert({
          user_id: user.id,
          credits_remaining: 0,
          tier: 'none'
        });
    }

    return new Response(
      JSON.stringify({
        subscribed: hasActiveSub,
        tier: tier,
        credits_remaining: creditsToAdd,
        subscription_end: subscriptionEnd
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Error checking subscription:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to check subscription";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
