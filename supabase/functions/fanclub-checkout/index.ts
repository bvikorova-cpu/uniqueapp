import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { authenticateUser, createSupabaseAdminClient } from "../_shared/supabaseClient.ts";
import { createStripeClient, getOrCreateStripeCustomer } from "../_shared/stripe.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };

const DEFAULT_ORIGIN = "https://uniqueapp.fun";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { fan_club_id } = await req.json();
    if (!fan_club_id) throw new Error("fan_club_id required");

    const { userId, email } = await authenticateUser(req);
    if (!email) throw new Error("Email not available");

    const admin = createSupabaseAdminClient();
    const { data: club, error: clubErr } = await admin
      .from("influencer_fan_clubs")
      .select("id, creator_id, name, tier, price_cents, currency, is_active")
      .eq("id", fan_club_id)
      .maybeSingle();

    if (clubErr || !club) throw new Error("Fan club not found");
    if (!club.is_active) throw new Error("Fan club is inactive");
    if (club.creator_id === userId) throw new Error("Creators cannot subscribe to their own fan club");

    const stripe = createStripeClient();
    const customerId = await getOrCreateStripeCustomer(stripe, email, userId);

    // Guard against duplicate active subs
    const existingSubs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 20 });
    const already = existingSubs.data.find((s) => s.metadata?.fan_club_id === club.id);
    if (already) { // Ensure DB row exists and short-circuit to portal-ish success
      await admin.from("influencer_fan_club_members").upsert(
        {
          fan_club_id: club.id,
          user_id: userId,
          status: "active",
          stripe_customer_id: customerId,
          stripe_subscription_id: already.id,
          current_period_end: (already as any).current_period_end
            ? new Date((already as any).current_period_end * 1000).toISOString()
            : null },
        { onConflict: "fan_club_id,user_id" },
      );
      return new Response(JSON.stringify({ already_member: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const origin = req.headers.get("origin") || DEFAULT_ORIGIN;
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: club.currency || "eur",
            recurring: { interval: "month" },
            unit_amount: club.price_cents,
            product_data: {
              name: `Fan Club: ${club.name} (${club.tier})` } },
          quantity: 1 },
      ],
      subscription_data: { metadata: {
          type: "fan_club",
          fan_club_id: club.id,
          creator_id: club.creator_id,
          user_id: userId } },
      metadata: { type: "fan_club",
        fan_club_id: club.id,
        creator_id: club.creator_id,
        user_id: userId },
      success_url: `${origin}/influ-king?fanclub=success&fan_club_id=${club.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/influ-king?fanclub=canceled&fan_club_id=${club.id}` });

    // Pre-insert pending membership so UI can reflect intent
    await admin.from("influencer_fan_club_members").upsert(
      { fan_club_id: club.id,
        user_id: userId,
        status: "pending",
        stripe_customer_id: customerId },
      { onConflict: "fan_club_id,user_id" },
    );

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("[fanclub-checkout]", e?.message);
    return new Response(JSON.stringify({ error: e?.message ?? "error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
