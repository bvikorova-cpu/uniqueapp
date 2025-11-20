import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

console.log("Horse Racing Stripe webhook handler initialized");

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");

  if (!signature) {
    console.error("No Stripe signature found");
    return new Response("No signature", { status: 400 });
  }

  try {
    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not set");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    );

    console.log("Webhook event received:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Checkout session completed:", session.id);

      const userId = session.metadata?.user_id;
      const coins = parseInt(session.metadata?.coins || "0");
      const gems = parseInt(session.metadata?.gems || "0");

      if (!userId) {
        console.error("No user_id in session metadata");
        return new Response("No user_id", { status: 400 });
      }

      console.log(`Adding ${coins} coins and ${gems} gems to user ${userId}`);

      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      // Get current currency
      const { data: currency, error: fetchError } = await supabaseAdmin
        .from("horse_currency")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching currency:", fetchError);
        return new Response("Database error", { status: 500 });
      }

      if (!currency) {
        // Create new currency record
        const { error: insertError } = await supabaseAdmin
          .from("horse_currency")
          .insert({
            user_id: userId,
            coins: coins,
            gems: gems,
          });

        if (insertError) {
          console.error("Error creating currency:", insertError);
          return new Response("Insert error", { status: 500 });
        }
      } else {
        // Update existing currency
        const { error: updateError } = await supabaseAdmin
          .from("horse_currency")
          .update({
            coins: currency.coins + coins,
            gems: currency.gems + gems,
          })
          .eq("user_id", userId);

        if (updateError) {
          console.error("Error updating currency:", updateError);
          return new Response("Update error", { status: 500 });
        }
      }

      console.log(`Successfully added currency to user ${userId}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
