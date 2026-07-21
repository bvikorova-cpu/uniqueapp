import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { authenticateUser, createSupabaseAdminClient } from "../_shared/supabaseClient.ts";
import { createStripeClient, getStripeCustomer, safeParseStripeDate } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Reconciles fan-club membership rows with Stripe reality.
 * - Called after checkout redirect and on the InfluKing page load.
 * - Optional { fan_club_id } narrows work; without it, reconciles all clubs.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const filterClubId: string | undefined = body?.fan_club_id;

    const { userId, email } = await authenticateUser(req);
    if (!email) throw new Error("Email not available");

    const stripe = createStripeClient();
    const admin = createSupabaseAdminClient();

    const customerId = await getStripeCustomer(stripe, email);
    if (!customerId) {
      return new Response(JSON.stringify({ memberships: [] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 100,
      expand: ["data.items.data.price"],
    });

    const relevant = subs.data.filter(
      (s) =>
        s.metadata?.type === "fan_club" &&
        s.metadata?.user_id === userId &&
        (!filterClubId || s.metadata?.fan_club_id === filterClubId),
    );

    const results: Array<Record<string, unknown>> = [];

    for (const sub of relevant) {
      const clubId = sub.metadata?.fan_club_id;
      if (!clubId) continue;

      const active =
        sub.status === "active" || sub.status === "trialing";
      const mappedStatus =
        sub.status === "active" || sub.status === "trialing"
          ? "active"
          : sub.status === "past_due"
            ? "past_due"
            : sub.status === "canceled" || sub.status === "unpaid"
              ? "canceled"
              : sub.status === "incomplete_expired"
                ? "expired"
                : "pending";

      const row = {
        fan_club_id: clubId,
        user_id: userId,
        status: mappedStatus,
        stripe_customer_id: customerId,
        stripe_subscription_id: sub.id,
        current_period_end: safeParseStripeDate((sub as any).current_period_end),
        cancel_at_period_end: Boolean((sub as any).cancel_at_period_end),
      };

      await admin
        .from("influencer_fan_club_members")
        .upsert(row, { onConflict: "fan_club_id,user_id" });

      results.push({ fan_club_id: clubId, active, status: mappedStatus });
    }

    return new Response(JSON.stringify({ memberships: results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("[fanclub-verify]", e?.message);
    return new Response(JSON.stringify({ error: e?.message ?? "error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
