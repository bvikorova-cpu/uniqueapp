import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-DECOR-SUBSCRIPTION] ${step}${detailsStr}`);
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found");
      
      // Update or insert subscription record
      await supabaseClient
        .from('decor_subscriptions')
        .upsert({
          user_id: user.id,
          tier: 'free',
          designs_used: 0,
          designs_limit: 0,
        }, {
          onConflict: 'user_id'
        });
      
      return new Response(JSON.stringify({ 
        tier: 'free',
        designs_limit: 0,
        designs_used: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let tier = 'free';
    let designsLimit = 0;

    if (hasActiveSub) {
      tier = 'pro';
      designsLimit = 50;
      const subscription = subscriptions.data[0];
      logStep("Active subscription found", { subscriptionId: subscription.id });
    } else {
      logStep("No active subscription");
    }

    // Update or insert subscription record
    const { data: existingSub } = await supabaseClient
      .from('decor_subscriptions')
      .select('designs_used')
      .eq('user_id', user.id)
      .single();

    await supabaseClient
      .from('decor_subscriptions')
      .upsert({
        user_id: user.id,
        tier: tier,
        designs_used: existingSub?.designs_used || 0,
        designs_limit: designsLimit,
      }, {
        onConflict: 'user_id'
      });

    return new Response(JSON.stringify({
      tier: tier,
      designs_limit: designsLimit,
      designs_used: existingSub?.designs_used || 0
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
