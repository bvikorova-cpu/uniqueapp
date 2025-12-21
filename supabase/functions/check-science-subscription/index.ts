import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SCIENCE-SUB] ${step}${detailsStr}`);
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Initialize or get usage record
    const { data: usageData, error: usageError } = await supabaseClient
      .from('kids_science_usage')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (usageError && usageError.code !== 'PGRST116') {
      throw usageError;
    }

    // Reset monthly counter if it's a new month
    const today = new Date().toISOString().split('T')[0];
    if (!usageData || usageData.last_reset_date !== today) {
      const isNewMonth = !usageData || new Date(usageData.last_reset_date).getMonth() !== new Date().getMonth();
      
      if (!usageData) {
        await supabaseClient
          .from('kids_science_usage')
          .insert({
            user_id: user.id,
            experiments_this_month: 0,
            last_reset_date: today
          });
      } else if (isNewMonth) {
        await supabaseClient
          .from('kids_science_usage')
          .update({
            experiments_this_month: 0,
            last_reset_date: today
          })
          .eq('user_id', user.id);
      }
    }

    // Check Stripe subscription
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found");
      
      const { data: currentUsage } = await supabaseClient
        .from('kids_science_usage')
        .select('experiments_this_month')
        .eq('user_id', user.id)
        .single();

      return new Response(JSON.stringify({
        subscribed: false,
        experiments_used: currentUsage?.experiments_this_month || 0,
        experiments_limit: 1
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
      limit: 1,
    });
    
    const hasActiveSub = subscriptions.data.length > 0;
    let productId = null;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      productId = subscription.items.data[0].price.product as string;
      logStep("Active subscription found", { subscriptionId: subscription.id, productId });

      // Update database
      await supabaseClient
        .from('kids_science_usage')
        .upsert({
          user_id: user.id,
          subscription_status: 'premium',
          product_id: productId,
          subscription_end: subscriptionEnd,
          last_reset_date: today
        }, { onConflict: 'user_id' });
    } else {
      logStep("No active subscription");
      
      // Update to free tier
      await supabaseClient
        .from('kids_science_usage')
        .upsert({
          user_id: user.id,
          subscription_status: 'free',
          product_id: null,
          subscription_end: null,
          last_reset_date: today
        }, { onConflict: 'user_id' });
    }

    // Get current usage
    const { data: finalUsage } = await supabaseClient
      .from('kids_science_usage')
      .select('experiments_this_month')
      .eq('user_id', user.id)
      .single();

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      product_id: productId,
      subscription_end: subscriptionEnd,
      experiments_used: finalUsage?.experiments_this_month || 0,
      experiments_limit: hasActiveSub ? -1 : 1 // -1 means unlimited
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