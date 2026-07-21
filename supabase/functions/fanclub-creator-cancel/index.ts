import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { authenticateUser, createSupabaseAdminClient } from "../_shared/supabaseClient.ts";
import { createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { fan_club_id, member_user_id, immediate = false } = await req.json();
    if (!fan_club_id || !member_user_id) throw new Error("fan_club_id and member_user_id required");

    const { userId } = await authenticateUser(req);
    const admin = createSupabaseAdminClient();

    // Verify caller owns the fan club
    const { data: club } = await admin
      .from("influencer_fan_clubs")
      .select("id, creator_id")
      .eq("id", fan_club_id)
      .maybeSingle();
    if (!club || club.creator_id !== userId) throw new Error("Not authorized");

    const { data: member } = await admin
      .from("influencer_fan_club_members")
      .select("stripe_subscription_id")
      .eq("fan_club_id", fan_club_id)
      .eq("user_id", member_user_id)
      .maybeSingle();
    if (!member?.stripe_subscription_id) throw new Error("No active subscription");

    const stripe = createStripeClient();
    if (immediate) {
      await stripe.subscriptions.cancel(member.stripe_subscription_id);
      await admin
        .from("influencer_fan_club_members")
        .update({ status: "canceled", cancel_at_period_end: false })
        .eq("fan_club_id", fan_club_id)
        .eq("user_id", member_user_id);
    } else {
      await stripe.subscriptions.update(member.stripe_subscription_id, {
        cancel_at_period_end: true,
      });
      await admin
        .from("influencer_fan_club_members")
        .update({ cancel_at_period_end: true })
        .eq("fan_club_id", fan_club_id)
        .eq("user_id", member_user_id);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("[fanclub-creator-cancel]", e?.message);
    return new Response(JSON.stringify({ error: e?.message ?? "error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
