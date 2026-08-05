import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };

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

    const body = await req.json().catch(() => ({}));
    if (body?.action === "admin_list_members") {
      const { data: roleRow } = await admin
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!roleRow) throw new Error("Admin only");

      const columns =
        "id, user_id, member_number, tier, status, is_founding, recipient_name, phone, shipping_address, shipping_note, shipping_status, tracking_number, shipped_at, delivered_at, started_at, current_period_end";
      let query = admin.from("club_memberships").select(columns);
      if (body?.tier === "digital" || body?.tier === "physical") query = query.eq("tier", body.tier);
      if (Array.isArray(body?.shippingStatus) && body.shippingStatus.length) {
        query = query.in("shipping_status", body.shippingStatus);
      }
      const { data, error } = await query.order("started_at", { ascending: false });
      if (error) throw error;

      const userIds = (data ?? []).map((membership) => membership.user_id);
      let profileByUser: Record<string, { email: string | null; name: string | null }> = {};
      if (userIds.length) {
        const { data: profiles } = await admin
          .from("profiles")
          .select("id, email, display_name, username")
          .in("id", userIds);
        profileByUser = Object.fromEntries(
          (profiles ?? []).map((profile) => [
            profile.id,
            { email: profile.email ?? null, name: profile.display_name ?? profile.username ?? null },
          ]),
        );
      }
      const items = (data ?? []).map((membership) => ({
        ...membership,
        user_email: profileByUser[membership.user_id]?.email ?? null,
        user_name: profileByUser[membership.user_id]?.name ?? null,
      }));
      const counts = {
        total: items.length,
        digital: items.filter((membership) => membership.tier === "digital").length,
        physical: items.filter((membership) => membership.tier === "physical").length,
        pending_shipping: items.filter(
          (membership) => membership.tier === "physical" && membership.shipping_status === "pending",
        ).length,
      };
      return new Response(JSON.stringify({ items, counts }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: m } = await admin
      .from("club_memberships")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!m) {
      return new Response(JSON.stringify({ is_member: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Reconcile from Stripe if we have a subscription id
    if (m.stripe_subscription_id) { try {
        const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
          apiVersion: "2025-08-27.basil" });
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
      JSON.stringify({ is_member: m.status === "active",
        membership: m }),
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
