import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    );

    console.log("Webhook event:", event.type);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Handle both checkout.session.completed and payment_intent.succeeded
    if (event.type === "checkout.session.completed" || event.type === "payment_intent.succeeded") {
      let userId: string | null = null;
      let credits = 0;
      let paymentStatus = "";
      let metadata: any = {};

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        paymentStatus = session.payment_status || "";
        userId = session.metadata?.user_id || null;
        credits = parseInt(session.metadata?.credits || "0");
        metadata = session.metadata || {};

        // Handle MasterChef gift payments
        if (paymentStatus === "paid" && metadata.type === "masterchef_gift") {
          console.log("Processing MasterChef gift payment", { sessionId: session.id });
          
          const { error: giftError } = await supabaseAdmin
            .from("masterchef_sent_gifts")
            .update({ 
              status: "completed",
              stripe_session_id: session.id
            })
            .eq("sender_id", metadata.sender_id)
            .eq("chef_id", metadata.chef_id)
            .eq("gift_id", metadata.gift_id)
            .is("stripe_session_id", null);

          if (giftError) {
            console.error("Error updating MasterChef gift:", giftError);
          } else {
            console.log("MasterChef gift marked as completed");
          }
        }
      } else if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        paymentStatus = "paid";
        userId = paymentIntent.metadata?.user_id || null;
        credits = parseInt(paymentIntent.metadata?.credits || "0");
        metadata = paymentIntent.metadata || {};
      }

      if (paymentStatus === "paid" && userId && credits > 0) {
        // Get current credits
        const { data: currentCredits } = await supabaseAdmin
          .from("ai_credits")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (currentCredits) {
          // Update existing record
          const { error } = await supabaseAdmin
            .from("ai_credits")
            .update({
              credits_remaining: currentCredits.credits_remaining + credits,
              total_credits_purchased: currentCredits.total_credits_purchased + credits,
            })
            .eq("user_id", userId);

          if (error) {
            console.error("Error updating credits:", error);
            throw error;
          }
        } else {
          // Create new record
          const { error } = await supabaseAdmin
            .from("ai_credits")
            .insert({
              user_id: userId,
              credits_remaining: credits,
              total_credits_purchased: credits,
            });

          if (error) {
            console.error("Error creating credits:", error);
            throw error;
          }
        }

        console.log(`Added ${credits} credits to user ${userId}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 400 }
    );
  }
});
