import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CONCERT-TICKET-CHECKOUT] ${step}${detailsStr}`);
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

    const { concertId, ticketTypeId } = await req.json();
    logStep("Received request", { concertId, ticketTypeId });

    if (!concertId || !ticketTypeId) {
      throw new Error("Missing required fields");
    }

    // Get ticket type details
    const { data: ticketType, error: ticketError } = await supabaseClient
      .from("concert_ticket_types")
      .select("*, live_concert_streams(title, musician_id, musician_profiles(stage_name))")
      .eq("id", ticketTypeId)
      .single();

    if (ticketError || !ticketType) {
      logStep("Ticket type not found", { error: ticketError });
      throw new Error("Ticket type not found");
    }

    logStep("Ticket type found", { ticketType });

    // Check if user already has a ticket for this concert
    const { data: existingPurchase } = await supabaseClient
      .from("concert_ticket_purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("concert_id", concertId)
      .eq("payment_status", "completed")
      .single();

    if (existingPurchase) {
      throw new Error("You already have a ticket for this concert");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      logStep("No existing customer found, creating new one");
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `${ticketType.name.toUpperCase()} Ticket - ${ticketType.live_concert_streams.title}`,
              description: `Live concert by ${ticketType.live_concert_streams.musician_profiles.stage_name}`,
            },
            unit_amount: Math.round(ticketType.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/live-concerts?success=true&type=ticket`,
      cancel_url: `${req.headers.get("origin")}/live-concerts?canceled=true`,
      metadata: {
        user_id: user.id,
        concert_id: concertId,
        ticket_type_id: ticketTypeId,
        musician_id: ticketType.live_concert_streams.musician_id,
        type: "concert_ticket",
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
