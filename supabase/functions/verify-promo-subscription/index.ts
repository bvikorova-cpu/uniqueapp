import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("sessionId required");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return new Response(JSON.stringify({ ok: false, status: session.status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const listingId = session.metadata?.listingId;
    const tier = session.metadata?.tier || "standard";
    if (!listingId) throw new Error("Missing listingId in session metadata");

    const subscriptionId = typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

    const activeUntil = new Date();
    activeUntil.setDate(activeUntil.getDate() + 30);

    const { data: updated, error: updErr } = await supabase
      .from("promo_listings")
      .update({
        status: "active",
        tier,
        stripe_subscription_id: subscriptionId ?? null,
        active_until: activeUntil.toISOString(),
      })
      .eq("id", listingId)
      .eq("user_id", user.id)
      .select()
      .maybeSingle();

    if (updErr) throw updErr;

    return new Response(JSON.stringify({ ok: true, listing: updated }), {
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
