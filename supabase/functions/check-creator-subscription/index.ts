import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (s: string, d?: unknown) =>
  console.log(`[CHECK-CREATOR-SUB] ${s}${d ? " " + JSON.stringify(d) : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { creatorId } = await req.json();
    if (!creatorId) throw new Error("creatorId required");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const { data: userData, error: userErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userErr || !userData.user?.email) throw new Error("Not authenticated");
    const user = userData.user;
    log("user", { id: user.id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const customerId = customers.data[0].id;

    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 100,
    });

    const match = subs.data.find(
      (s) => s.metadata?.creator_id === creatorId && s.metadata?.kind === "creator_subscription",
    );

    if (!match) {
      // Mark any stale local record as inactive
      await supabase
        .from("creator_subscriptions")
        .update({ status: "inactive" })
        .eq("subscriber_id", user.id)
        .eq("creator_id", creatorId);

      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tierId = match.metadata?.tier_id ?? null;
    const periodEnd = new Date(match.current_period_end * 1000).toISOString();

    // Sync local record (best-effort)
    await supabase.from("creator_subscriptions").upsert(
      {
        subscriber_id: user.id,
        creator_id: creatorId,
        tier_id: tierId,
        status: "active",
        stripe_subscription_id: match.id,
        current_period_end: periodEnd,
      },
      { onConflict: "subscriber_id,creator_id" },
    );

    return new Response(
      JSON.stringify({
        subscribed: true,
        tier_id: tierId,
        subscription_end: periodEnd,
        stripe_subscription_id: match.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg, subscribed: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
