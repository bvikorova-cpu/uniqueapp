import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-VOICE-SUBSCRIPTION] ${step}${detailsStr}`);
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
    logStep("Authorization header found");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    logStep("Authenticating user");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found");
      return new Response(JSON.stringify({ 
        hasVoiceLibrary: false,
        hasUnlimitedTTS: false,
        hasAIConversation: false,
        hasCloneSetup: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 100,
    });

    let hasVoiceLibrary = false;
    let hasUnlimitedTTS = false;
    let hasAIConversation = false;
    let subscriptionEnds: { [key: string]: string } = {};

    for (const sub of subscriptions.data) {
      const subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();
      
      for (const item of sub.items.data) {
        const priceId = item.price.id;
        
        if (priceId === "price_1SQD3qGaXSfGtYFtLEOizLmJ") {
          hasVoiceLibrary = true;
          subscriptionEnds.voiceLibrary = subscriptionEnd;
        } else if (priceId === "price_1SQD3XGaXSfGtYFtmcOEBBfI") {
          hasUnlimitedTTS = true;
          subscriptionEnds.unlimitedTTS = subscriptionEnd;
        } else if (priceId === "price_1SQD46GaXSfGtYFtqUR0AHDN") {
          hasAIConversation = true;
          subscriptionEnds.aiConversation = subscriptionEnd;
        }
      }
    }

    // Check one-time payments (Voice Clone Setup)
    const payments = await stripe.checkout.sessions.list({
      customer: customerId,
      limit: 100,
    });

    let hasCloneSetup = false;
    for (const session of payments.data) {
      if (session.payment_status === "paid" && session.mode === "payment") {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        for (const item of lineItems.data) {
          if (item.price?.id === "price_1SQD3DGaXSfGtYFtg52PlpKe") {
            hasCloneSetup = true;
            break;
          }
        }
      }
      if (hasCloneSetup) break;
    }

    logStep("Subscription check complete", {
      hasVoiceLibrary,
      hasUnlimitedTTS,
      hasAIConversation,
      hasCloneSetup
    });

    return new Response(JSON.stringify({
      hasVoiceLibrary,
      hasUnlimitedTTS,
      hasAIConversation,
      hasCloneSetup,
      subscriptionEnds
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-voice-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
