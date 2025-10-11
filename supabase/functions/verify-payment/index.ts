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

  try {
    const { session_id } = await req.json();
    
    if (!session_id) {
      throw new Error("Missing session_id");
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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get metadata from session
    const itemId = session.metadata?.item_id;
    const itemType = session.metadata?.item_type;
    const sellerId = session.metadata?.seller_id;
    const platformFee = parseFloat(session.metadata?.platform_fee || "0.50");
    const sellerAmount = parseFloat(session.metadata?.seller_amount || "0");

    if (!itemId || !itemType || !sellerId) {
      console.error("Missing required metadata");
      throw new Error("Missing required metadata");
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

    console.log(`[Verify Payment] Transaction created for ${itemType} ${itemId}`);

    // Mark item as sold
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
