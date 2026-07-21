import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { authenticateUser, createSupabaseAdminClient } from "../_shared/supabaseClient.ts";
import { createStripeClient, safeParseStripeDate } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Swap between tiers of the same creator's fan clubs.
 * - Updates the existing Stripe subscription item with new price_data (prorated).
 * - Moves the DB row from the old fan_club_id to the new one.
 * - Both clubs must belong to the same creator.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { from_fan_club_id, to_fan_club_id } = await req.json();
    if (!from_fan_club_id || !to_fan_club_id) throw new Error("from_fan_club_id and to_fan_club_id required");
    if (from_fan_club_id === to_fan_club_id) throw new Error("Cannot swap to the same tier");

    const { userId } = await authenticateUser(req);
    const admin = createSupabaseAdminClient();

    const { data: clubs, error: clubsErr } = await admin
      .from("influencer_fan_clubs")
      .select("id, creator_id, name, tier, price_cents, currency, is_active")
      .in("id", [from_fan_club_id, to_fan_club_id]);
    if (clubsErr) throw clubsErr;
    const from = clubs?.find((c) => c.id === from_fan_club_id);
    const to = clubs?.find((c) => c.id === to_fan_club_id);
    if (!from || !to) throw new Error("Fan club not found");
    if (from.creator_id !== to.creator_id) throw new Error("Tier swap only within the same creator");
    if (!to.is_active) throw new Error("Target fan club is inactive");

    const { data: member } = await admin
      .from("influencer_fan_club_members")
      .select("stripe_subscription_id, stripe_customer_id")
      .eq("fan_club_id", from_fan_club_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (!member?.stripe_subscription_id) throw new Error("No active subscription to swap");

    const stripe = createStripeClient();
    const sub = await stripe.subscriptions.retrieve(member.stripe_subscription_id);
    if (sub.status !== "active" && sub.status !== "trialing") {
      throw new Error(`Cannot swap tier while subscription is ${sub.status}`);
    }
    const item = sub.items.data[0];
    if (!item) throw new Error("Subscription has no items");

    const updated = await stripe.subscriptions.update(member.stripe_subscription_id, {
      cancel_at_period_end: false,
      proration_behavior: "create_prorations",
      items: [
        {
          id: item.id,
          price_data: {
            currency: to.currency || "eur",
            recurring: { interval: "month" },
            unit_amount: to.price_cents,
            product: (item.price?.product as string) ?? undefined,
            product_data: (item.price?.product as string)
              ? undefined
              : { name: `Fan Club: ${to.name} (${to.tier})` },
          } as any,
        },
      ],
      metadata: {
        type: "fan_club",
        fan_club_id: to.id,
        creator_id: to.creator_id,
        user_id: userId,
      },
    });

    // Move DB row: remove old, upsert new.
    await admin
      .from("influencer_fan_club_members")
      .delete()
      .eq("fan_club_id", from_fan_club_id)
      .eq("user_id", userId);

    await admin.from("influencer_fan_club_members").upsert(
      {
        fan_club_id: to.id,
        user_id: userId,
        status: "active",
        stripe_customer_id: member.stripe_customer_id,
        stripe_subscription_id: updated.id,
        current_period_end: safeParseStripeDate((updated as any).current_period_end),
        cancel_at_period_end: Boolean((updated as any).cancel_at_period_end),
      },
      { onConflict: "fan_club_id,user_id" },
    );

    return new Response(JSON.stringify({ ok: true, fan_club_id: to.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("[fanclub-swap]", e?.message);
    return new Response(JSON.stringify({ error: e?.message ?? "error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
