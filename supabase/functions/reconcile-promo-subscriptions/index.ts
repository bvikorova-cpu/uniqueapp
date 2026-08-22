import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Self-healing reconcile for promo listings.
 * If a user paid but never landed on /promotions/success (tab closed, mobile
 * redirect lost, etc.), the listing stays "pending" forever. This function
 * re-checks every pending listing of the CALLING user against Stripe and
 * activates the ones whose checkout session is paid.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const { data: userData } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    const { data: pending, error: pendErr } = await supabase
      .from("promo_listings")
      .select("id,stripe_session_id,tier,status")
      .eq("user_id", user.id)
      .neq("status", "active")
      .not("stripe_session_id", "is", null);
    if (pendErr) throw pendErr;

    if (!pending?.length) {
      return new Response(JSON.stringify({ ok: true, activated: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    let activated = 0;
    for (const row of pending) {
      try {
        const session = await stripe.checkout.sessions.retrieve(row.stripe_session_id as string, {
          expand: ["subscription"],
        });
        const paid = session.payment_status === "paid" || session.status === "complete";
        if (!paid) continue;

        const subscriptionId = typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id ?? null;

        const activeUntil = new Date();
        activeUntil.setDate(activeUntil.getDate() + 30);

        const { error: updErr } = await supabase
          .from("promo_listings")
          .update({
            status: "active",
            tier: (session.metadata?.tier as string) || row.tier || "standard",
            stripe_subscription_id: subscriptionId,
            active_until: activeUntil.toISOString(),
          })
          .eq("id", row.id)
          .eq("user_id", user.id);
        if (!updErr) activated++;
      } catch (_e) {
        // Ignore individual session failures (e.g. expired/unknown session id).
      }
    }

    return new Response(JSON.stringify({ ok: true, activated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
