import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-DATING-GIFT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));
    
    if (userError || !user) throw new Error("Unauthorized");
    logStep("User authenticated", { userId: user.id });

    const { matchId, giftId, message } = await req.json();
    logStep("Received request", { matchId, giftId });

    if (!matchId || !giftId) {
      throw new Error("Missing required fields");
    }

    // Get gift details
    const { data: gift, error: giftError } = await supabaseClient
      .from("dating_gifts")
      .select("*")
      .eq("id", giftId)
      .single();

    if (giftError || !gift) {
      logStep("Gift not found", { error: giftError });
      throw new Error("Gift not found");
    }

    // Get match details to find receiver
    const { data: match, error: matchError } = await supabaseClient
      .from("dating_matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (matchError || !match) {
      logStep("Match not found", { error: matchError });
      throw new Error("Match not found");
    }

    const receiverId = match.user1_id === user.id ? match.user2_id : match.user1_id;
    logStep("Match and gift found", { receiverId, gift });

    // Get receiver profile name
    const { data: receiverProfile } = await supabaseClient
      .from("dating_profiles")
      .select("display_name")
      .eq("user_id", receiverId)
      .single();

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `${gift.icon} ${gift.name}`,
              description: message || `Gift for ${receiverProfile?.display_name || 'your match'}`,
            },
            unit_amount: Math.round(gift.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/dating?success=true&type=gift`,
      cancel_url: `${req.headers.get("origin")}/dating?canceled=true`,
      metadata: {
        sender_id: user.id,
        receiver_id: receiverId,
        gift_id: giftId,
        match_id: matchId,
        message: message || "",
        type: "dating_gift",
      },
    });

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    logStep("ERROR", { error: error instanceof Error ? error.message : error });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
