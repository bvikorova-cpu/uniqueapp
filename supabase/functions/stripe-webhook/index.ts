import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { verifyAndProcessPayment } from "../_shared/paymentVerification.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

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

    logStep("Event received", { type: event.type });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentStatus = session.payment_status || "";
      const metadata = session.metadata || {};
      const sessionId = session.id;

      logStep("Processing checkout session", { 
        sessionId, 
        paymentStatus, 
        metadataType: metadata.type || metadata.credit_type 
      });

      // CRITICAL: Only process if payment is actually paid
      if (paymentStatus !== "paid") {
        logStep("Payment not completed, skipping", { paymentStatus });
        return new Response(JSON.stringify({ received: true, skipped: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Handle credit purchases - use centralized verification
      const creditType = metadata.credit_type || metadata.type;
      const credits = parseInt(metadata.credits || "0");
      
      if (credits > 0 && creditType) {
        logStep("Processing credit purchase", { creditType, credits });
        
        const result = await verifyAndProcessPayment(supabaseAdmin, sessionId);
        
        if (result.success) {
          logStep("Credit purchase processed", { 
            credits: result.credits, 
            alreadyProcessed: result.alreadyProcessed 
          });
        } else {
          logStep("Credit purchase failed", { error: result.error });
        }
      }

      // Handle concert ticket purchases
      if (metadata.type === "concert_ticket") {
        logStep("Processing concert ticket");
        
        const ticketPrice = session.amount_total ? session.amount_total / 100 : 0;
        const musicianAmount = ticketPrice * 0.80;
        const platformCommission = ticketPrice * 0.20;
        
        const { error: ticketError } = await supabaseAdmin
          .from("concert_ticket_purchases")
          .insert({
            user_id: metadata.user_id,
            concert_id: metadata.concert_id,
            ticket_type_id: metadata.ticket_type_id,
            amount_paid: ticketPrice,
            payment_status: "completed",
            stripe_session_id: sessionId
          });

        if (!ticketError) {
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

          // Create audit trail
          await supabaseAdmin.from("transactions").insert({
            user_id: metadata.user_id,
            transaction_type: "concert_ticket",
            amount: ticketPrice,
            commission_rate: 0.20,
            commission_amount: platformCommission,
            seller_amount: musicianAmount,
            status: "completed",
            item_type: "concert_ticket",
            stripe_session_id: sessionId,
            seller_id: metadata.musician_id,
          });
        }
      }

      // Handle concert gifts
      if (metadata.type === "concert_gift") {
        logStep("Processing concert gift");
        
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
            stripe_session_id: sessionId
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

          // Create audit trail
          await supabaseAdmin.from("transactions").insert({
            user_id: metadata.sender_id,
            transaction_type: "gift",
            amount: giftPrice,
            commission_rate: 0.20,
            commission_amount: platformCommission,
            seller_amount: musicianAmount,
            status: "completed",
            item_type: "concert_gift",
            stripe_session_id: sessionId,
            seller_id: metadata.musician_id,
          });
        }
      }

      // Handle holographic avatar purchases
      if (metadata.type === "holographic_avatar") {
        logStep("Processing holographic avatar purchase");
        
        const serviceType = metadata.feature || "unknown";
        const isSubscription = session.mode === "subscription";
        
        const purchaseData: any = {
          user_id: metadata.user_id,
          service_type: serviceType,
          status: "active",
          stripe_session_id: sessionId,
        };

        if (isSubscription && session.subscription) {
          purchaseData.stripe_subscription_id = session.subscription;
        } else {
          const expiresAt = new Date();
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
          purchaseData.expires_at = expiresAt.toISOString();
        }

        await supabaseAdmin.from("holographic_purchases").insert(purchaseData);
      }

      // Handle time capsule purchases
      if (metadata.type === "time_capsule" || metadata.type === "time_capsule_premium") {
        logStep("Processing time capsule purchase");
        
        const isSubscription = metadata.type === "time_capsule_premium";
        const durationYears = metadata.duration_years ? parseInt(metadata.duration_years) : null;
        
        const purchaseData: any = {
          user_id: metadata.user_id,
          service_type: isSubscription ? "premium_subscription" : `${durationYears}_year`,
          status: "active",
          stripe_session_id: sessionId,
          duration_years: durationYears,
        };

        if (isSubscription && session.subscription) {
          purchaseData.stripe_subscription_id = session.subscription;
        } else if (durationYears) {
          const expiresAt = new Date();
          expiresAt.setFullYear(expiresAt.getFullYear() + durationYears);
          purchaseData.expires_at = expiresAt.toISOString();
        }

        await supabaseAdmin.from("time_capsule_purchases").insert(purchaseData);
      }

      // Handle property listing payment
      if (metadata.type === "property_listing") {
        logStep("Processing property listing payment");
        
        await supabaseAdmin
          .from("property_listing_packages")
          .update({ payment_status: "completed" })
          .eq("stripe_session_id", sessionId);
      }

      // Handle MasterChef gift payments
      if (metadata.type === "masterchef_gift") {
        logStep("Processing MasterChef gift payment");
        
        const { data: giftData, error: giftError } = await supabaseAdmin
          .from("masterchef_sent_gifts")
          .update({ 
            status: "completed",
            stripe_session_id: sessionId
          })
          .eq("sender_id", metadata.sender_id)
          .eq("chef_id", metadata.chef_id)
          .eq("gift_id", metadata.gift_id)
          .is("stripe_session_id", null)
          .select('id, chef_id, chef_amount')
          .single();

        if (!giftError && giftData) {
          // Notify admins
          const { data: adminUsers } = await supabaseAdmin
            .from("user_roles")
            .select("user_id")
            .eq("role", "admin");

          if (adminUsers) {
            const { data: chefProfile } = await supabaseAdmin
              .from("profiles")
              .select("full_name")
              .eq("id", metadata.chef_id)
              .single();

            for (const admin of adminUsers) {
              await supabaseAdmin.from("notifications").insert({
                user_id: admin.user_id,
                type: "masterchef_withdrawal",
                message: `${chefProfile?.full_name || 'Chef'} received a gift worth €${Number(giftData.chef_amount).toFixed(2)}`
              });
            }
          }
        }
      }

      // Handle Influencer gift payments
      if (metadata.type === "influencer_gift") {
        logStep("Processing Influencer gift payment");
        
        await supabaseAdmin
          .from("influencer_sent_gifts")
          .update({ 
            status: "completed",
            stripe_payment_intent: session.payment_intent
          })
          .eq("sender_id", metadata.sender_id)
          .eq("influencer_id", metadata.influencer_id)
          .eq("gift_id", metadata.gift_id)
          .eq("stripe_session_id", sessionId);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[STRIPE-WEBHOOK] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 400 }
    );
  }
});
