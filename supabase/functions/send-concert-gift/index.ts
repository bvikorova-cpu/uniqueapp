import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-CONCERT-GIFT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { concertId, giftId, message } = await req.json();
    logStep("Received request", { concertId, giftId });

    if (!concertId || !giftId) {
      throw new Error("Missing required fields");
    }

    // Get gift details
    const { data: gift, error: giftError } = await supabaseClient
      .from("platform_gifts")
      .select("*")
      .eq("id", giftId)
      .single();

    if (giftError || !gift) {
      logStep("Gift not found", { error: giftError });
      throw new Error("Gift not found");
    }

    // Get concert details
    const { data: concert, error: concertError } = await supabaseClient
      .from("live_concert_streams")
      .select("musician_id, title, musician_profiles(stage_name)")
      .eq("id", concertId)
      .single();

    if (concertError || !concert) {
      logStep("Concert not found", { error: concertError });
      throw new Error("Concert not found");
    }

    logStep("Concert and gift found", { concert, gift });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      logStep("No existing customer found");
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `${gift.icon} ${gift.name}`,
              description: message || `Gift for ${concert.musician_profiles.stage_name}`,
            },
            unit_amount: Math.round(gift.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/live-concerts/${concertId}?success=true&type=gift`,
      cancel_url: `${req.headers.get("origin")}/live-concerts/${concertId}?canceled=true`,
      metadata: {
        sender_id: user.id,
        concert_id: concertId,
        musician_id: concert.musician_id,
        gift_id: giftId,
        message: message || "",
        type: "concert_gift",
      },
      client_reference_id: user.id,
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url, session_id: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    logStep("ERROR", { message: error instanceof Error ? error.message : "Unknown error" });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
