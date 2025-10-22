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

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Authenticate user first
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Authentication failed");
    }

    const { session_id } = await req.json();
    
    // Validate session_id format
    if (!session_id || typeof session_id !== 'string' || !session_id.startsWith('cs_')) {
      throw new Error("Invalid session_id format");
    }

    console.log(`[Verify Payment] Processing session: ${session_id}`);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    console.log(`[Verify Payment] Session status: ${session.payment_status}`);
    console.log(`[Verify Payment] Metadata:`, session.metadata);

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    // Verify the session belongs to the authenticated user
    const sessionUserId = session.client_reference_id || session.customer;
    if (sessionUserId !== user.id) {
      console.error(`[Verify Payment] User mismatch: ${sessionUserId} vs ${user.id}`);
      throw new Error("Session does not belong to authenticated user");
    }

    // Get metadata from session
    const itemId = session.metadata?.item_id;
    const itemType = session.metadata?.item_type || session.metadata?.type;
    const sellerId = session.metadata?.seller_id;
    const platformFee = parseFloat(session.metadata?.platform_fee || "0.50");
    const sellerAmount = parseFloat(session.metadata?.seller_amount || "0");
    
    // Stream gift specific metadata
    const streamId = session.metadata?.stream_id;
    const giftId = session.metadata?.gift_id;
    const senderId = session.metadata?.sender_id;
    const influencerId = session.metadata?.influencer_id;
    const message = session.metadata?.message || "";

    // Validate metadata based on payment type
    if (itemType === "stream_gift") {
      if (!streamId || !giftId || !senderId || !influencerId) {
        console.error("Missing required stream gift metadata");
        throw new Error("Missing required metadata for stream gift");
      }
    } else {
      if (!itemId || !itemType || !sellerId) {
        console.error("Missing required metadata");
        throw new Error("Missing required metadata");
      }
    }

    const totalAmount = session.amount_total ? session.amount_total / 100 : 0;

    // Check if transaction already exists
    const { data: existingTransaction } = await supabase
      .from("transactions")
      .select("id")
      .eq("stripe_payment_id", session.payment_intent as string)
      .maybeSingle();

    if (existingTransaction) {
      console.log(`[Verify Payment] Transaction already exists`);
      return new Response(JSON.stringify({ success: true, message: "Transaction already recorded" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        stripe_payment_id: session.payment_intent as string,
        buyer_id: session.client_reference_id || session.customer as string,
        seller_id: sellerId,
        item_id: itemId,
        item_type: itemType,
        total_amount: totalAmount,
        platform_fee: platformFee,
        seller_amount: sellerAmount,
        status: "pending"
      });

    if (transactionError) {
      console.error("Error creating transaction:", transactionError);
      throw transactionError;
    }

    console.log(`[Verify Payment] Transaction created for ${itemType} ${itemId || streamId}`);

    // Handle stream gift
    if (itemType === "stream_gift") {
      // Calculate commission (20%)
      const commissionAmount = totalAmount * 0.20;
      const influencerAmount = totalAmount - commissionAmount;

      // Create stream gift record
      const { error: giftError } = await supabase
        .from("stream_gifts")
        .insert({
          stream_id: streamId,
          sender_id: senderId,
          gift_id: giftId,
          gift_type: giftId,
          amount: totalAmount,
          message: message,
          status: "completed",
          stripe_session_id: session_id
        });

      if (giftError) {
        console.error("Error creating stream gift:", giftError);
        throw giftError;
      }

      // Create transaction for influencer earnings
      await supabase
        .from("transactions")
        .insert({
          user_id: influencerId,
          seller_id: influencerId,
          buyer_id: senderId,
          stream_id: streamId,
          item_id: giftId,
          item_type: "stream_gift",
          amount: totalAmount,
          commission_amount: commissionAmount,
          seller_amount: influencerAmount,
          status: "completed",
          transaction_type: "stream_gift",
          stripe_payment_id: session.payment_intent as string
        });

      console.log(`[Verify Payment] Stream gift recorded with 20% commission`);
    } else {
      // Mark item as sold for bazaar/auction
      if (itemType === "bazaar") {
        await supabase
          .from("bazaar_items")
          .update({ is_active: false })
          .eq("id", itemId);
      } else if (itemType === "auction") {
        await supabase
          .from("auction_items")
          .update({ 
            is_active: false, 
            winner_id: session.client_reference_id || session.customer as string 
          })
          .eq("id", itemId);
      }

      console.log(`[Verify Payment] Item marked as sold`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in verify-payment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
