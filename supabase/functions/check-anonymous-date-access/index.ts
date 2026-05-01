import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user?.email) {
      return new Response(JSON.stringify({ error: "User not authenticated" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    console.log("Checking subscription for user:", user.id);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Find Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      console.log("No Stripe customer found");
      return new Response(
        JSON.stringify({ hasAccess: false, subscriptionEnd: null }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const customerId = customers.data[0].id;
    console.log("Found customer:", customerId);

    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSubscription = subscriptions.data.length > 0;
    let subscriptionEnd: string | null = null;
    let stripeSubscriptionId: string | null = null;

    // Safe date conversion helper
    const safeTimestampToISO = (ts: number | null | undefined): string | null => {
      if (!ts || typeof ts !== 'number') return null;
      try {
        return new Date(ts * 1000).toISOString();
      } catch {
        return null;
      }
    };

    if (hasActiveSubscription) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = safeTimestampToISO(subscription.current_period_end);
      stripeSubscriptionId = subscription.id;
      const periodStart = safeTimestampToISO(subscription.current_period_start);
      console.log("Active subscription found:", stripeSubscriptionId);

      // Update or create subscription record in database
      const { data: existingSub } = await supabaseClient
        .from("anonymous_dating_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (existingSub) {
        await supabaseClient
          .from("anonymous_dating_subscriptions")
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: stripeSubscriptionId,
            subscription_status: "active",
            current_period_start: periodStart,
            current_period_end: subscriptionEnd,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
      } else {
        await supabaseClient
          .from("anonymous_dating_subscriptions")
          .insert({
            user_id: user.id,
            stripe_customer_id: customerId,
            stripe_subscription_id: stripeSubscriptionId,
            subscription_status: "active",
            current_period_start: periodStart,
            current_period_end: subscriptionEnd,
          });
      }
    } else {
      console.log("No active subscription found");
      // Update status to inactive if exists
      await supabaseClient
        .from("anonymous_dating_subscriptions")
        .update({
          subscription_status: "inactive",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
    }

    return new Response(
      JSON.stringify({ 
        hasAccess: hasActiveSubscription, 
        subscriptionEnd 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});