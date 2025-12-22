import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-HEALTHCARE-SUBSCRIPTION] ${step}${detailsStr}`);
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
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Find Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      
      // Update healthcare_profile to inactive
      await supabaseClient
        .from('healthcare_profiles')
        .upsert({ 
          user_id: user.id,
          subscription_status: 'inactive',
          subscription_tier: 'none'
        }, {
          onConflict: 'user_id'
        });
      
      return new Response(JSON.stringify({ 
        subscribed: false,
        subscription_tier: 'none',
        subscription_status: 'inactive'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = 'none';
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      const priceId = subscription.items.data[0].price.id;
      
      // Map price IDs to tiers - using the actual price IDs from Stripe
      const tierMap: Record<string, string> = {
        "price_1SRv390QTWhd4oRpM8xbH4hm": "pediatric_mini",
        "price_1SRv3SGaXSfGtYFtIxUFVzYa": "pediatric_standard",
        "price_1SRv3mGaXSfGtYFtAKPsmIuj": "dental_plus",
        "price_1SRv420QTWhd4oRpAwuVmcrG": "therapy_lite",
        "price_1SRv4h0QTWhd4oRpv9tvXboN": "therapy_professional",
        "price_1SRvD3GaXSfGtYFtlBnIKIq8": "clinic_premium",
        "price_1SRvDeGaXSfGtYFtCj31V4Wi": "hospital_package",
        "price_1SRvDyGaXSfGtYFtlGV3f3Zs": "oncology_pediatric",
        "price_1SRvEH0QTWhd4oRptr7evlXq": "physiotherapy",
        "price_1SRvEaGaXSfGtYFt5QEbP47H": "speech_therapy",
        "price_1SRvF7GaXSfGtYFtcg0vJI7H": "occupational_therapy",
        "price_1SRvFQ0QTWhd4oRpHT6IP5tg": "adhd_specialist",
        "price_1SRvFjGaXSfGtYFt303VBIYt": "autism_center",
      };
      
      subscriptionTier = tierMap[priceId] || 'none';
      logStep("Active subscription found", { 
        subscriptionId: subscription.id, 
        tier: subscriptionTier,
        endDate: subscriptionEnd 
      });

      // Update healthcare_profile
      await supabaseClient
        .from('healthcare_profiles')
        .upsert({ 
          user_id: user.id,
          subscription_status: 'active',
          subscription_tier: subscriptionTier,
          subscription_expires_at: subscriptionEnd
        }, {
          onConflict: 'user_id'
        });
    } else {
      logStep("No active subscription found");
      
      // Update healthcare_profile to inactive
      await supabaseClient
        .from('healthcare_profiles')
        .upsert({ 
          user_id: user.id,
          subscription_status: 'inactive',
          subscription_tier: 'none'
        }, {
          onConflict: 'user_id'
        });
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_status: hasActiveSub ? 'active' : 'inactive',
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-healthcare-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
