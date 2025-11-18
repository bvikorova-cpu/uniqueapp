import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[F1-STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Credit amounts by tier
const TIER_CREDITS = {
  'basic': 50,
  'premium': 150,
  'ultimate': 500,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const signature = req.headers.get("stripe-signature");
    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!webhookSecret) {
      throw new Error("Stripe webhook secret not configured");
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logStep("Webhook signature verification failed", { error: errorMessage });
      return new Response(JSON.stringify({ error: "Webhook signature verification failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Event received", { type: event.type });

    // Handle checkout.session.completed - initial subscription creation
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const tier = session.metadata?.tier?.toLowerCase() || 'basic';

      if (!userId) {
        logStep("No user_id in metadata");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      logStep("Processing checkout", { userId, tier });

      const credits = TIER_CREDITS[tier as keyof typeof TIER_CREDITS] || 50;

      // Create or update credits
      const { error: creditsError } = await supabaseClient
        .from('f1_user_credits')
        .upsert({
          user_id: userId,
          credits_remaining: credits,
          credits_purchased: credits,
          tier: tier,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (creditsError) {
        logStep("Error creating credits", { error: creditsError });
        throw creditsError;
      }

      logStep("Credits assigned", { userId, credits, tier });

      // Get subscription details
      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        
        // Store subscription details
        const { error: subError } = await supabaseClient
          .from('f1_subscriptions')
          .upsert({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: session.customer as string,
            tier: tier,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          }, {
            onConflict: 'user_id',
          });

        if (subError) {
          logStep("Error storing subscription", { error: subError });
          throw subError;
        }

        logStep("Subscription stored", { subscriptionId: subscription.id });
      }
    }

    // Handle invoice.payment_succeeded - monthly renewal
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;
      
      if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        
        // Find user by stripe customer id
        const { data: subData, error: subError } = await supabaseClient
          .from('f1_subscriptions')
          .select('user_id, tier')
          .eq('stripe_customer_id', invoice.customer as string)
          .single();

        if (subError || !subData) {
          logStep("Subscription not found for customer", { customerId: invoice.customer });
          return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }

        const tier = subData.tier?.toLowerCase() || 'basic';
        const credits = TIER_CREDITS[tier as keyof typeof TIER_CREDITS] || 50;

        // Replenish credits
        const { error: creditsError } = await supabaseClient
          .from('f1_user_credits')
          .update({
            credits_remaining: credits,
            credits_purchased: credits,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', subData.user_id);

        if (creditsError) {
          logStep("Error replenishing credits", { error: creditsError });
          throw creditsError;
        }

        logStep("Credits replenished", { userId: subData.user_id, credits });

        // Update subscription dates
        const { error: updateError } = await supabaseClient
          .from('f1_subscriptions')
          .update({
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            status: subscription.status,
          })
          .eq('user_id', subData.user_id);

        if (updateError) {
          logStep("Error updating subscription", { error: updateError });
        }
      }
    }

    // Handle customer.subscription.deleted - cancellation
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      
      // Find user by stripe subscription id
      const { data: subData, error: subError } = await supabaseClient
        .from('f1_subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subscription.id)
        .single();

      if (subError || !subData) {
        logStep("Subscription not found", { subscriptionId: subscription.id });
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Update subscription status
      const { error: updateError } = await supabaseClient
        .from('f1_subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', subData.user_id);

      if (updateError) {
        logStep("Error updating subscription status", { error: updateError });
      }

      logStep("Subscription canceled", { userId: subData.user_id });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
