import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DATING-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");

  if (!signature) {
    logStep("No signature header");
    return new Response("No signature", { status: 400 });
  }

  try {
    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET_DATING");

    if (!webhookSecret) {
      throw new Error("Webhook secret not configured");
    }

    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    );

    logStep("Webhook event received", { type: event.type });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      logStep("Checkout completed", { sessionId: session.id });

      const metadata = session.metadata;
      
      if (metadata?.type === "dating_gift") {
        // Record gift in database
        const { error: giftError } = await supabaseAdmin
          .from("dating_sent_gifts")
          .insert([{
            sender_id: metadata.sender_id,
            receiver_id: metadata.receiver_id,
            gift_id: metadata.gift_id,
            match_id: metadata.match_id,
            message: metadata.message || null,
            payment_intent_id: session.payment_intent,
          }]);

        if (giftError) {
          logStep("Error recording gift", { error: giftError });
          throw giftError;
        }

        // Create notification for receiver
        await supabaseAdmin
          .from("notifications")
          .insert([{
            user_id: metadata.receiver_id,
            type: "dating_gift",
            title: "Gift Received 🎁",
            message: metadata.message || "Someone sent you a gift!",
            related_id: metadata.match_id,
          }]);

        logStep("Gift recorded and notification sent");
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    logStep("ERROR", { error: error instanceof Error ? error.message : error });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Webhook error" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
