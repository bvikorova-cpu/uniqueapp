import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { authenticateUser, createSupabaseAdminClient } from "../_shared/supabaseClient.ts";
import { createStripeClient } from "../_shared/stripe.ts";
import { createLogger } from "../_shared/logger.ts";

const log = createLogger("check-creator-subscription");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user, userId } = await authenticateUser(req);
    const { creatorId } = await req.json();
    
    if (!creatorId) throw new Error("Creator ID is required");
    log("Checking subscription", { userId, creatorId });

    const stripe = createStripeClient();
    const supabase = createSupabaseAdminClient();

    const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId, status: "active", limit: 100,
    });

    const activeSubscription = subscriptions.data.find(
      (sub: { metadata: Record<string, string> }) => sub.metadata.creator_id === creatorId
    );

    if (!activeSubscription) {
      const { data: existingMembership } = await supabase
        .from('creator_memberships')
        .select('*')
        .eq('creator_id', creatorId)
        .eq('subscriber_id', userId)
        .maybeSingle();

      if (existingMembership) {
        await supabase
          .from('creator_memberships')
          .update({ status: 'cancelled' })
          .eq('id', existingMembership.id);
      }

      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tierId = activeSubscription.metadata.tier_id;
    const subscriptionEnd = new Date(activeSubscription.current_period_end * 1000).toISOString();

    // Update membership
    const { data: existingMembership } = await supabase
      .from('creator_memberships')
      .select('*')
      .eq('creator_id', creatorId)
      .eq('subscriber_id', userId)
      .maybeSingle();

    const membershipData = {
      creator_id: creatorId,
      subscriber_id: userId,
      tier_id: tierId,
      status: 'active',
      expires_at: subscriptionEnd,
      stripe_subscription_id: activeSubscription.id
    };

    if (existingMembership) {
      await supabase.from('creator_memberships').update(membershipData).eq('id', existingMembership.id);
    } else {
      await supabase.from('creator_memberships').insert(membershipData);
    }

    // Update subscriber count
    const { count } = await supabase
      .from('creator_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', creatorId)
      .eq('status', 'active');

    await supabase
      .from('creator_profiles')
      .update({ total_subscribers: count || 0 })
      .eq('id', creatorId);

    return new Response(JSON.stringify({
      subscribed: true,
      tier_id: tierId,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
