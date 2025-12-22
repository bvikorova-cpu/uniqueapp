import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    const { creatorId } = await req.json();
    
    if (!creatorId) {
      throw new Error("Creator ID is required");
    }

    console.log(`Checking subscription for user ${user.email}, creator ${creatorId}`);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Get customer from Stripe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      console.log("No customer found");
      return new Response(
        JSON.stringify({ subscribed: false }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const customerId = customers.data[0].id;
    console.log(`Found customer: ${customerId}`);

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 100,
    });

    console.log(`Found ${subscriptions.data.length} active subscriptions`);

    // Check if any subscription is for this creator
    let activeSubscription = null;
    for (const sub of subscriptions.data) {
      if (sub.metadata.creator_id === creatorId) {
        activeSubscription = sub;
        break;
      }
    }

    if (!activeSubscription) {
      console.log("No active subscription for this creator");
      
      // Update or create membership record as inactive
      const { data: existingMembership } = await supabaseClient
        .from('creator_memberships')
        .select('*')
        .eq('creator_id', creatorId)
        .eq('subscriber_id', user.id)
        .maybeSingle();

      if (existingMembership) {
        await supabaseClient
          .from('creator_memberships')
          .update({ status: 'cancelled' })
          .eq('id', existingMembership.id);
      }

      return new Response(
        JSON.stringify({ subscribed: false }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`Active subscription found: ${activeSubscription.id}`);

    const tierId = activeSubscription.metadata.tier_id;
    const subscriptionEnd = new Date(activeSubscription.current_period_end * 1000).toISOString();

    // Update or create membership record
    const { data: existingMembership } = await supabaseClient
      .from('creator_memberships')
      .select('*')
      .eq('creator_id', creatorId)
      .eq('subscriber_id', user.id)
      .maybeSingle();

    if (existingMembership) {
      await supabaseClient
        .from('creator_memberships')
        .update({
          status: 'active',
          tier_id: tierId,
          expires_at: subscriptionEnd,
          stripe_subscription_id: activeSubscription.id
        })
        .eq('id', existingMembership.id);
    } else {
      await supabaseClient
        .from('creator_memberships')
        .insert({
          creator_id: creatorId,
          subscriber_id: user.id,
          tier_id: tierId,
          status: 'active',
          expires_at: subscriptionEnd,
          stripe_subscription_id: activeSubscription.id
        });
    }

    // Update creator total subscribers count
    const { count } = await supabaseClient
      .from('creator_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', creatorId)
      .eq('status', 'active');

    await supabaseClient
      .from('creator_profiles')
      .update({ total_subscribers: count || 0 })
      .eq('id', creatorId);

    console.log("Subscription verified and updated");

    return new Response(
      JSON.stringify({
        subscribed: true,
        tier_id: tierId,
        subscription_end: subscriptionEnd
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error checking subscription:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
