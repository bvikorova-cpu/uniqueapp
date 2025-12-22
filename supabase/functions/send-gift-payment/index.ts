import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { giftId, creatorId, message } = await req.json();

    // Get gift details
    const { data: gift } = await supabaseClient
      .from("virtual_gifts")
      .select("*")
      .eq("id", giftId)
      .single();

    if (!gift) throw new Error("Gift not found");

    // Calculate fees (10% platform fee)
    const amountPaid = Number(gift.price);
    const platformFee = amountPaid * 0.10;
    const creatorEarning = amountPaid - platformFee;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amountPaid * 100), // Convert to cents
      currency: "eur",
      customer: customerId,
      metadata: {
        gift_id: giftId,
        creator_id: creatorId,
        sender_id: user.id,
        platform_fee: platformFee.toFixed(2),
        creator_earning: creatorEarning.toFixed(2),
      },
    });

    // Record gift in database
    const { error: giftError } = await supabaseClient
      .from("creator_gifts_sent")
      .insert({
        gift_id: giftId,
        sender_id: user.id,
        recipient_creator_id: creatorId,
        message: message || null,
        amount_paid: amountPaid,
        platform_fee: platformFee,
        creator_earning: creatorEarning,
        stripe_payment_intent_id: paymentIntent.id,
      });

    if (giftError) throw giftError;

    // Update creator earnings
    const { error: earningsError } = await supabaseClient.rpc(
      "increment",
      {
        table_name: "creator_profiles",
        column_name: "total_earnings",
        row_id: creatorId,
        increment_by: creatorEarning,
      }
    );

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        giftId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});