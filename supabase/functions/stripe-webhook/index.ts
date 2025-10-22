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

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      if (session.payment_status === "paid" && session.metadata) {
        const userId = session.metadata.user_id;
        const credits = parseInt(session.metadata.credits || "0");

        if (userId && credits > 0) {
          const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
          );

          // Get current credits
          const { data: currentCredits } = await supabaseAdmin
            .from("antique_credits")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();

          if (currentCredits) {
            // Update existing record
            const { error } = await supabaseAdmin
              .from("antique_credits")
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
              .from("antique_credits")
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
