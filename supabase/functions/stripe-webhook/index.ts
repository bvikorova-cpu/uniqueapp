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

    // Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
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

      // Handle property listing payments
      // Handle concert ticket purchases
      if (paymentStatus === "paid" && metadata.type === "concert_ticket") {
        console.log("Processing concert ticket", { sessionId: session.id });
        
        const ticketPrice = session.amount_total ? session.amount_total / 100 : 0;
        const musicianAmount = ticketPrice * 0.80; // 80% to musician
        const platformCommission = ticketPrice * 0.20; // 20% platform fee
        
        // Create ticket purchase record
        const { error: ticketError } = await supabaseAdmin
          .from("concert_ticket_purchases")
          .insert({
            user_id: metadata.user_id,
            concert_id: metadata.concert_id,
            ticket_type_id: metadata.ticket_type_id,
            amount_paid: ticketPrice,
            payment_status: "completed",
            stripe_session_id: session.id
          });

        if (ticketError) {
          console.error("Error creating ticket:", ticketError);
        } else {
          // Record musician earnings
          await supabaseAdmin
            .from("musician_earnings")
            .insert({
              musician_id: metadata.musician_id,
              transaction_type: "ticket_sale",
              total_amount: ticketPrice,
              musician_amount: musicianAmount,
              platform_commission: platformCommission,
              commission_rate: 20.00,
              related_id: metadata.concert_id
            });
        }
      }

      // Handle concert gifts
      if (paymentStatus === "paid" && metadata.type === "concert_gift") {
        console.log("Processing concert gift", { sessionId: session.id });
        
        const giftPrice = session.amount_total ? session.amount_total / 100 : 0;
        const musicianAmount = giftPrice * 0.80;
        const platformCommission = giftPrice * 0.20;
        
        const { error: giftError } = await supabaseAdmin
          .from("concert_gifts")
          .insert({
            sender_id: metadata.sender_id,
            musician_id: metadata.musician_id,
            concert_id: metadata.concert_id,
            gift_id: metadata.gift_id,
            amount: giftPrice,
            message: metadata.message,
            stripe_session_id: session.id
          });

        if (!giftError) {
          await supabaseAdmin
            .from("musician_earnings")
            .insert({
              musician_id: metadata.musician_id,
              transaction_type: "gift",
              total_amount: giftPrice,
              musician_amount: musicianAmount,
              platform_commission: platformCommission,
              commission_rate: 20.00,
              related_id: metadata.concert_id
            });
        }
      }

      // Handle holographic avatar purchases
      if (paymentStatus === "paid" && metadata.type === "holographic_avatar") {
        console.log("Processing holographic avatar purchase", { sessionId: session.id });
        
        const serviceType = metadata.feature || "unknown";
        const isSubscription = session.mode === "subscription";
        
        const purchaseData: any = {
          user_id: metadata.user_id,
          service_type: serviceType,
          status: "active",
          stripe_session_id: session.id,
        };

        if (isSubscription && session.subscription) {
          purchaseData.stripe_subscription_id = session.subscription;
          // Subscriptions don't expire (managed by Stripe)
        } else {
          // One-time purchases expire after 1 year
          const expiresAt = new Date();
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
          purchaseData.expires_at = expiresAt.toISOString();
        }

        const { error: purchaseError } = await supabaseAdmin
          .from("holographic_purchases")
          .insert(purchaseData);

        if (purchaseError) {
          console.error("Error creating holographic purchase:", purchaseError);
        } else {
          console.log("Holographic avatar purchase recorded");
        }
      }

      // Handle time capsule purchases
      if (paymentStatus === "paid" && (metadata.type === "time_capsule" || metadata.type === "time_capsule_premium")) {
        console.log("Processing time capsule purchase", { sessionId: session.id });
        
        const isSubscription = metadata.type === "time_capsule_premium";
        const durationYears = metadata.duration_years ? parseInt(metadata.duration_years) : null;
        
        const purchaseData: any = {
          user_id: metadata.user_id,
          service_type: isSubscription ? "premium_subscription" : `${durationYears}_year`,
          status: "active",
          stripe_session_id: session.id,
          duration_years: durationYears,
        };

        if (isSubscription && session.subscription) {
          purchaseData.stripe_subscription_id = session.subscription;
          // Premium subscription doesn't expire (managed by Stripe)
        } else if (durationYears) {
          // Calculate expiration date based on duration
          const expiresAt = new Date();
          expiresAt.setFullYear(expiresAt.getFullYear() + durationYears);
          purchaseData.expires_at = expiresAt.toISOString();
        }

        const { error: purchaseError } = await supabaseAdmin
          .from("time_capsule_purchases")
          .insert(purchaseData);

        if (purchaseError) {
          console.error("Error creating time capsule purchase:", purchaseError);
        } else {
          console.log("Time capsule purchase recorded");
        }
      }

      if (paymentStatus === "paid" && metadata.type === "property_listing") {
        console.log("Processing property listing payment", { sessionId: session.id });
        
        const { error: packageError } = await supabaseAdmin
          .from("property_listing_packages")
          .update({ payment_status: "completed" })
          .eq("stripe_session_id", session.id);

        if (packageError) {
          console.error("Error updating property listing package:", packageError);
        } else {
          console.log("Property listing package activated - trigger will activate property");
        }
      }

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
