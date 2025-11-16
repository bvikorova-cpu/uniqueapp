import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CAMPAIGN-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook started");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      throw new Error("Webhook secret not configured");
    }

    logStep("Verifying webhook signature");
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider()
    );

    logStep("Event received", { type: event.type, id: event.id });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Handle successful payment
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      logStep("Processing checkout session", { sessionId: session.id });

      const metadata = session.metadata;
      if (!metadata || !metadata.campaign_id) {
        logStep("No campaign metadata found, skipping");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      const {
        campaign_id,
        campaign_type,
        donor_id,
        is_monthly,
        is_anonymous,
        platform_fee,
        net_amount,
        donor_name,
        message,
      } = metadata;

      // Get payment intent details
      let paymentIntentId = null;
      let subscriptionId = null;
      
      if (session.payment_intent) {
        paymentIntentId = typeof session.payment_intent === 'string' 
          ? session.payment_intent 
          : session.payment_intent.id;
      }
      
      if (session.subscription) {
        subscriptionId = typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription.id;
      }

      logStep("Creating donation record", {
        campaignId: campaign_id,
        campaignType: campaign_type,
        amount: session.amount_total,
      });

      // Create donation record
      const { data: donation, error: donationError } = await supabaseClient
        .from('campaign_donations')
        .insert({
          campaign_id,
          campaign_type,
          donor_id: donor_id === 'guest' ? null : donor_id,
          donor_email: session.customer_email || session.customer_details?.email,
          donor_name: donor_name || null,
          amount: (session.amount_total || 0) / 100, // Convert from cents
          platform_fee: parseFloat(platform_fee),
          net_amount: parseFloat(net_amount),
          is_monthly: is_monthly === 'true',
          is_anonymous: is_anonymous === 'true',
          message: message || null,
          stripe_session_id: session.id,
          stripe_payment_intent_id: paymentIntentId,
          stripe_subscription_id: subscriptionId,
          status: 'completed',
          payment_method: session.payment_method_types?.[0] || 'card',
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (donationError) {
        logStep("ERROR creating donation", { error: donationError });
        throw donationError;
      }

      logStep("Donation record created successfully", { donationId: donation.id });
    }

    // Handle successful subscription payment
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;
      
      if (invoice.subscription) {
        logStep("Processing subscription payment", { 
          invoiceId: invoice.id,
          subscriptionId: invoice.subscription 
        });

        // Get subscription details to find campaign metadata
        const subscriptionId = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription.id;
          
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const metadata = subscription.metadata;

        if (metadata && metadata.campaign_id) {
          const {
            campaign_id,
            campaign_type,
            donor_id,
            is_anonymous,
            platform_fee,
            net_amount,
            donor_name,
            message,
          } = metadata;

          // Create recurring donation record
          const { error: donationError } = await supabaseClient
            .from('campaign_donations')
            .insert({
              campaign_id,
              campaign_type,
              donor_id: donor_id === 'guest' ? null : donor_id,
              donor_email: invoice.customer_email,
              donor_name: donor_name || null,
              amount: (invoice.amount_paid || 0) / 100,
              platform_fee: parseFloat(platform_fee),
              net_amount: parseFloat(net_amount),
              is_monthly: true,
              is_anonymous: is_anonymous === 'true',
              message: message || null,
              stripe_payment_intent_id: typeof invoice.payment_intent === 'string' 
                ? invoice.payment_intent 
                : invoice.payment_intent?.id,
              stripe_subscription_id: subscriptionId,
              status: 'completed',
              payment_method: 'card',
              completed_at: new Date().toISOString(),
            });

          if (donationError) {
            logStep("ERROR creating recurring donation", { error: donationError });
            throw donationError;
          }

          logStep("Recurring donation recorded successfully");
        }
      }
    }

    // Handle failed payment
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      logStep("Payment failed", { paymentIntentId: paymentIntent.id });

      // Update donation status to failed if exists
      await supabaseClient
        .from('campaign_donations')
        .update({ status: 'failed' })
        .eq('stripe_payment_intent_id', paymentIntent.id);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
