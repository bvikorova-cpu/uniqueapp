import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STORY_PRICE_IDS = {
  basic: "price_1SRu0RGaXSfGtYFt4mElYH8D",
  personalized: "price_1SRu0h0QTWhd4oRpmsTtRlDj",
  video: "price_1SRu0wGaXSfGtYFtQViBRYrr",
  ar: "price_1SRu1BGaXSfGtYFt1Hxy9lC1",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[CREATE-STORY-PAYMENT] Function started");

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
    
    console.log("[CREATE-STORY-PAYMENT] User authenticated", { userId: user.id, email: user.email });

    const { storyType } = await req.json();
    if (!storyType || !STORY_PRICE_IDS[storyType as keyof typeof STORY_PRICE_IDS]) {
      throw new Error("Invalid story type");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2025-08-27.basil" 
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: STORY_PRICE_IDS[storyType as keyof typeof STORY_PRICE_IDS],
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/kids-pricing?payment=success&story=${storyType}`,
      cancel_url: `${req.headers.get("origin")}/kids-pricing?payment=canceled`,
      metadata: {
        user_id: user.id,
        story_type: storyType,
        purchase_type: "single_story"
      },
    });

    console.log("[CREATE-STORY-PAYMENT] Session created", { sessionId: session.id, storyType });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[CREATE-STORY-PAYMENT] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});