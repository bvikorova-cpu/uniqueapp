import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { authenticateUser, createSupabaseAdminClient } from "../_shared/supabaseClient.ts";
import { createStripeClient, hasActiveSubscription } from "../_shared/stripe.ts";
import { createLogger } from "../_shared/logger.ts";

const log = createLogger("check-companions-subscription");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("Function started");
    const { user, userId } = await authenticateUser(req);
    log("User authenticated", { userId });

    const supabase = createSupabaseAdminClient();

    // Get or create subscription record
    let { data: subRecord } = await supabase
      .from("companions_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!subRecord) {
      const { data: newRecord } = await supabase
        .from("companions_subscriptions")
        .insert({ user_id: userId })
        .select()
        .single();
      subRecord = newRecord;
    }

    const stripe = createStripeClient();
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 });

    if (customers.data.length === 0) {
      log("No Stripe customer found");
      return new Response(JSON.stringify({
        subscribed: false,
        free_messages_used: subRecord?.free_messages_used || 0,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = customers.data[0].id;
    log("Found customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    });

    // Check for companions subscription by metadata
    const hasActiveSub = subscriptions.data.some((sub: any) => {
      const metadata = sub.metadata || {};
      return metadata.type === "companions" || sub.items.data.some((item: any) => {
        return item.price.metadata?.type === "companions";
      });
    });

    if (hasActiveSub) {
      await supabase
        .from("companions_subscriptions")
        .update({ subscription_status: "active" })
        .eq("user_id", userId);
    }

    log("Subscription check complete", { hasActiveSub });

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      free_messages_used: subRecord?.free_messages_used || 0,
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
