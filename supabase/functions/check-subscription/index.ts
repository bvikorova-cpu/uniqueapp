import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRICE_TO_TIER = {
  "price_basic_monthly": "basic",
  "price_premium_monthly": "premium",
  "price_business_monthly": "business",
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
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw userError;
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      // No Stripe customer - update to free tier
      await supabaseClient
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          tier: 'free',
          price: 0,
          status: 'active',
          expires_at: null,
        }, {
          onConflict: 'user_id',
        });

      return new Response(
        JSON.stringify({ tier: "free", active: false }),
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
      await supabaseClient
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          tier: 'free',
          price: 0,
          status: 'active',
          expires_at: null,
        }, {
          onConflict: 'user_id',
        });

      return new Response(
        JSON.stringify({ tier: "free", active: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0].price.id;
    const tier = PRICE_TO_TIER[priceId as keyof typeof PRICE_TO_TIER] || "free";
    const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();

    // Update subscription in database
    await supabaseClient
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        tier: tier,
        price: subscription.items.data[0].price.unit_amount! / 100,
        status: 'active',
        expires_at: expiresAt,
      }, {
        onConflict: 'user_id',
      });

    return new Response(
      JSON.stringify({
        tier: tier,
        active: true,
        expires_at: expiresAt,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Check subscription error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
