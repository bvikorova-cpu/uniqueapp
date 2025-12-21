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

  try {
    console.log("[CHECK-COMPANIONS-SUBSCRIPTION] Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    console.log("[CHECK-COMPANIONS-SUBSCRIPTION] User authenticated:", user.id);

    // Get or create subscription record
    let { data: subRecord } = await supabaseClient
      .from("companions_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!subRecord) {
      const { data: newRecord } = await supabaseClient
        .from("companions_subscriptions")
        .insert({ user_id: user.id })
        .select()
        .single();
      subRecord = newRecord;
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      console.log("[CHECK-COMPANIONS-SUBSCRIPTION] No Stripe customer found");
      return new Response(JSON.stringify({
        subscribed: false,
        free_messages_used: subRecord?.free_messages_used || 0,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    console.log("[CHECK-COMPANIONS-SUBSCRIPTION] Found customer:", customerId);

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    });

    // Check for companions subscription by looking at metadata or product
    const hasActiveSub = subscriptions.data.some((sub: any) => {
      const metadata = sub.metadata || {};
      return metadata.type === "companions" || sub.items.data.some((item: any) => {
        const price = item.price;
        return price.metadata?.type === "companions";
      });
    });

    if (hasActiveSub) {
      await supabaseClient
        .from("companions_subscriptions")
        .update({ subscription_status: "active" })
        .eq("user_id", user.id);
    }

    console.log("[CHECK-COMPANIONS-SUBSCRIPTION] Active subscription:", hasActiveSub);

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      free_messages_used: subRecord?.free_messages_used || 0,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[CHECK-COMPANIONS-SUBSCRIPTION] ERROR:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
