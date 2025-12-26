import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const ESCROW_HOLD_DAYS = 7;

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AUCTION-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    logStep("ERROR", "No signature provided");
    return new Response("No signature", { status: 400 });
  }

  try {
    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_AUCTION_WEBHOOK_SECRET");

    if (!webhookSecret) {
      logStep("ERROR", "Webhook secret not configured");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    );

    logStep("Event received", { type: event.type, id: event.id });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      logStep("Processing checkout session", { sessionId: session.id });

      const auctionId = session.metadata?.auction_id;
      const escrowEnabled = session.metadata?.escrow_enabled === "true";
      const winnerId = session.metadata?.winner_id;
      const sellerId = session.metadata?.seller_id;
      const amount = parseFloat(session.metadata?.amount || "0");
      const commissionAmount = parseFloat(session.metadata?.commission_amount || "0");
      const sellerPayout = parseFloat(session.metadata?.seller_payout || "0");

      if (!auctionId) {
        logStep("ERROR", "No auction_id in metadata");
        return new Response("No auction_id", { status: 400 });
      }

      // Get auction details
      const { data: auction, error: auctionError } = await supabase
        .from("auction_items")
        .select("*")
        .eq("id", auctionId)
        .single();

      if (auctionError || !auction) {
        logStep("ERROR", { message: "Auction not found", auctionId });
        return new Response("Auction not found", { status: 404 });
      }

      logStep("Auction found", { auctionId, title: auction.title });

      // Update auction to paid and set winner
      await supabase
        .from("auction_items")
        .update({
          is_active: false,
          winner_id: winnerId,
          paid_at: new Date().toISOString(),
          escrow_status: escrowEnabled ? "held" : "none",
        })
        .eq("id", auctionId);

      logStep("Auction marked as paid", { auctionId, winnerId });

      // Create escrow hold if enabled
      if (escrowEnabled) {
        const autoReleaseAt = new Date();
        autoReleaseAt.setDate(autoReleaseAt.getDate() + ESCROW_HOLD_DAYS);

        const { data: escrow, error: escrowError } = await supabase
          .from("auction_escrow")
          .insert({
            auction_id: auctionId,
            winner_id: winnerId,
            seller_id: sellerId,
            amount,
            commission_amount: commissionAmount,
            seller_payout: sellerPayout,
            status: "held",
            auto_release_at: autoReleaseAt.toISOString(),
            stripe_payment_intent_id: session.payment_intent as string,
          })
          .select()
          .single();

        if (escrowError) {
          logStep("ERROR creating escrow", { error: escrowError });
        } else {
          logStep("Escrow created", { escrowId: escrow.id, autoReleaseAt });
        }
      }

      // Get seller email for notification
      const { data: sellerProfile } = await supabase
        .from("profiles")
        .select("email, display_name")
        .eq("id", sellerId)
        .single();

      // Create notifications
      await supabase.from("notifications").insert([
        {
          user_id: winnerId,
          type: "auction_payment",
          title: "Payment Successful",
          message: `Your payment for "${auction.title}" was successful. Wait for the seller to ship the item.`,
          related_id: auctionId,
        },
        {
          user_id: sellerId,
          type: "auction_sold",
          title: "Auction Sold!",
          message: `Your auction "${auction.title}" has been sold for €${amount.toFixed(2)}. Please ship the item as soon as possible.`,
          related_id: auctionId,
        },
      ]);

      logStep("Notifications created");
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const auctionId = paymentIntent.metadata?.auction_id;

      if (auctionId) {
        await supabase
          .from("auction_items")
          .update({ escrow_status: "payment_failed" })
          .eq("id", auctionId);

        logStep("Auction marked as payment failed", { auctionId });
      }
    }

    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = charge.payment_intent as string;

      // Find escrow by payment intent
      const { data: escrow } = await supabase
        .from("auction_escrow")
        .select("*")
        .eq("stripe_payment_intent_id", paymentIntentId)
        .single();

      if (escrow) {
        await supabase
          .from("auction_escrow")
          .update({ 
            status: "refunded",
            refunded_at: new Date().toISOString(),
          })
          .eq("id", escrow.id);

        await supabase
          .from("auction_items")
          .update({ escrow_status: "refunded" })
          .eq("id", escrow.auction_id);

        logStep("Auction escrow marked as refunded", { auctionId: escrow.auction_id });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    logStep("ERROR", { message: error instanceof Error ? error.message : error });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Webhook failed" }),
      { status: 400 }
    );
  }
});
