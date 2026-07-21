import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { authenticateUser, createSupabaseAdminClient } from "../_shared/supabaseClient.ts";
import { createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Undo a scheduled cancellation (cancel_at_period_end=true) on a fan-club sub.
 * Only works while the subscription is still active in Stripe.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { fan_club_id } = await req.json();
    if (!fan_club_id) throw new Error("fan_club_id required");

    const { userId } = await authenticateUser(req);
    const admin = createSupabaseAdminClient();

    const { data: member } = await admin
      .from("influencer_fan_club_members")
      .select("stripe_subscription_id, status")
      .eq("fan_club_id", fan_club_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (!member?.stripe_subscription_id) throw new Error("No subscription to resume");

    const stripe = createStripeClient();
    const sub = await stripe.subscriptions.retrieve(member.stripe_subscription_id);
    if (sub.status === "canceled") throw new Error("Subscription already canceled; please re-join");

    await stripe.subscriptions.update(member.stripe_subscription_id, {
      cancel_at_period_end: false,
    });

    await admin
      .from("influencer_fan_club_members")
      .update({ cancel_at_period_end: false, status: "active" })
      .eq("fan_club_id", fan_club_id)
      .eq("user_id", userId);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("[fanclub-resume]", e?.message);
    return new Response(JSON.stringify({ error: e?.message ?? "error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
