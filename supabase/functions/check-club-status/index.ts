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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");
    const anon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: uData } = await anon.auth.getUser(token);
    if (!uData.user) throw new Error("Not authenticated");
    const user = uData.user;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: m } = await admin
      .from("club_memberships")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!m) {
      return new Response(JSON.stringify({ is_member: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Reconcile from Stripe if we have a subscription id
    if (m.stripe_subscription_id) {
      try {
        const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
          apiVersion: "2025-08-27.basil",
        });
        const sub = await stripe.subscriptions.retrieve(m.stripe_subscription_id);
        const status =
          sub.status === "active" || sub.status === "trialing"
            ? "active"
            : sub.status === "past_due"
              ? "past_due"
              : "canceled";
        const periodEnd = new Date(sub.current_period_end * 1000).toISOString();
        if (status !== m.status || periodEnd !== m.current_period_end) {
          await admin
            .from("club_memberships")
            .update({ status, current_period_end: periodEnd })
            .eq("id", m.id);
          m.status = status;
          m.current_period_end = periodEnd;
        }
      } catch (e) {
        console.warn("Stripe reconcile failed", e);
      }
    }

    return new Response(
      JSON.stringify({
        is_member: m.status === "active",
        membership: m,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (e) {
    console.error("[check-club-status]", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
