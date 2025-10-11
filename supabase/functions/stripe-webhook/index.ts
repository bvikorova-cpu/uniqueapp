import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    console.error("Missing signature or webhook secret");
    return new Response("Webhook Error: Missing signature", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log(`[Stripe Webhook] Event type: ${event.type}`);

    // Handle successful payment
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log(`[Stripe Webhook] Processing session: ${session.id}`);
      console.log(`[Stripe Webhook] Metadata:`, session.metadata);

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
        return new Response("Missing metadata", { status: 400 });
      }

      const totalAmount = session.amount_total ? session.amount_total / 100 : 0;

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

      console.log(`[Stripe Webhook] Transaction created for ${itemType} ${itemId}`);

      // Mark item as sold
      if (itemType === "bazaar") {
        await supabase
          .from("bazaar_items")
          .update({ is_active: false })
          .eq("id", itemId);
      } else if (itemType === "auction") {
        await supabase
          .from("auction_items")
          .update({ is_active: false, winner_id: session.client_reference_id || session.customer as string })
          .eq("id", itemId);
      }

      console.log(`[Stripe Webhook] Item marked as sold`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
  }
});
