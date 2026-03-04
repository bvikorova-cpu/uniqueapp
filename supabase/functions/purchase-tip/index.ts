import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PURCHASE-TIP] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function started');

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { predictionId } = await req.json();
    if (!predictionId) throw new Error("Prediction ID is required");

    logStep("Request data", { predictionId });

    // Get prediction details
    const { data: prediction, error: predError } = await supabaseClient
      .from('sports_predictions')
      .select('*, sports_tipsters(*)')
      .eq('id', predictionId)
      .single();

    if (predError) throw new Error(`Failed to fetch prediction: ${predError.message}`);
    if (!prediction) throw new Error("Prediction not found");
    if (!prediction.is_premium) throw new Error("This prediction is not for sale");

    logStep("Prediction found", { price: prediction.price });

    // Check if user already purchased this tip
    const { data: existingPurchase } = await supabaseClient
      .from('sports_purchased_tips')
      .select('id')
      .eq('user_id', user.id)
      .eq('prediction_id', predictionId)
      .maybeSingle();

    if (existingPurchase) {
      throw new Error("You already purchased this tip");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    logStep("Creating checkout session");

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: Math.round(prediction.price * 100),
            product_data: {
              name: `Premium Tip: ${prediction.sports_tipsters?.display_name || 'Expert Tipster'}`,
              description: `Premium sports prediction for match`,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/sports-predictor?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/sports-predictor?purchase=cancelled`,
      metadata: {
        user_id: user.id,
        prediction_id: predictionId,
        tipster_id: prediction.tipster_id,
        type: 'tip_purchase',
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in purchase-tip", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
