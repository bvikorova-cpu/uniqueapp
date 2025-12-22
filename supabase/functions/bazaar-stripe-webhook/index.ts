import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { createEscrowHold, ESCROW_HOLD_DAYS } from "../_shared/escrow.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[BAZAAR-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    logStep("ERROR", "No signature provided");
    return new Response("No signature", { status: 400 });
  }

  try {
    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_BAZAAR_WEBHOOK_SECRET");

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

      const orderId = session.metadata?.order_id;
      const escrowEnabled = session.metadata?.escrow_enabled === "true";

      if (!orderId) {
        logStep("ERROR", "No order_id in metadata");
        return new Response("No order_id", { status: 400 });
      }

      // Get order details
      const { data: order, error: orderError } = await supabase
        .from("bazaar_orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderError || !order) {
        logStep("ERROR", { message: "Order not found", orderId });
        return new Response("Order not found", { status: 404 });
      }

      logStep("Order found", { orderId, status: order.status });

      // Update order to paid
      await supabase
        .from("bazaar_orders")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      // Update transaction if exists
      if (order.transaction_id) {
        await supabase
          .from("bazaar_transactions")
          .update({
            status: "completed",
            stripe_payment_intent_id: session.payment_intent as string,
            payment_completed_at: new Date().toISOString(),
          })
          .eq("id", order.transaction_id);
      }

      // Mark item as sold
      const { data: item } = await supabase
        .from("bazaar_items")
        .update({ is_sold: true, is_active: false })
        .eq("id", order.item_id)
        .select()
        .single();

      logStep("Item marked as sold", { itemId: order.item_id });

      // Create escrow hold if enabled
      if (escrowEnabled) {
        try {
          const escrow = await createEscrowHold(
            supabase,
            orderId,
            order.amount,
            order.commission_amount,
            order.seller_payout,
            ESCROW_HOLD_DAYS
          );
          logStep("Escrow created", { escrowId: escrow.id });

          // Update order status
          await supabase
            .from("bazaar_orders")
            .update({ status: "escrow_held", escrow_status: "held" })
            .eq("id", orderId);
        } catch (escrowError) {
          logStep("ERROR creating escrow", { error: escrowError });
        }
      }

      // Create notifications for buyer and seller
      await supabase.from("bazaar_notifications").insert([
        {
          user_id: order.buyer_id,
          order_id: orderId,
          type: "payment_success",
          title: "Platba úspešná",
          message: `Vaša platba za "${item?.title || 'položku'}" bola úspešná. Čakajte na odoslanie.`,
        },
        {
          user_id: order.seller_id,
          order_id: orderId,
          type: "new_order",
          title: "Nová objednávka",
          message: `Máte novú objednávku pre "${item?.title || 'položku'}". Prosím, odošlite položku čo najskôr.`,
        },
      ]);

      logStep("Notifications created");
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.order_id;

      if (orderId) {
        await supabase
          .from("bazaar_orders")
          .update({ status: "payment_failed" })
          .eq("id", orderId);

        logStep("Order marked as payment failed", { orderId });
      }
    }

    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = charge.payment_intent as string;

      // Find order by payment intent
      const { data: transaction } = await supabase
        .from("bazaar_transactions")
        .select("*, bazaar_orders(*)")
        .eq("stripe_payment_intent_id", paymentIntentId)
        .single();

      if (transaction) {
        await supabase
          .from("bazaar_orders")
          .update({ status: "refunded", escrow_status: "refunded" })
          .eq("id", transaction.bazaar_orders?.id);

        logStep("Order marked as refunded", { orderId: transaction.bazaar_orders?.id });
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
