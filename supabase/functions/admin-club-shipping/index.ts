// Admin-only: list pending physical cards and update shipping status.
// Actions: 'list' | 'mark_shipped' | 'mark_delivered'

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");
    const anon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const { data: uData } = await anon.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!uData.user) throw new Error("Not authenticated");
    const user = uData.user;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Admin only");

    const body = await req.json().catch(() => ({}));
    const action = body?.action ?? "list";

    if (action === "list" || action === "list_members") {
      const columns =
        "id, user_id, member_number, tier, status, is_founding, recipient_name, phone, shipping_address, shipping_note, shipping_status, tracking_number, shipped_at, delivered_at, started_at, current_period_end";

      let query = admin.from("club_memberships").select(columns);

      if (action === "list") {
        // Legacy shipping queue: physical cards only
        query = query
          .eq("tier", "physical")
          .in("shipping_status", body?.status ?? ["pending", "shipped"]);
      } else {
        // Full members overview: optional tier / status filters
        if (body?.tier === "digital" || body?.tier === "physical") {
          query = query.eq("tier", body.tier);
        }
        if (Array.isArray(body?.shippingStatus) && body.shippingStatus.length) {
          query = query.in("shipping_status", body.shippingStatus);
        }
      }

      const { data, error } = await query.order("started_at", { ascending: false });
      if (error) throw error;

      // Best-effort attach emails
      const userIds = (data ?? []).map((m: any) => m.user_id);
      let profileByUser: Record<string, { email: string | null; name: string | null }> = {};
      if (userIds.length) {
        const { data: profs } = await admin
          .from("profiles")
          .select("id, email, display_name, username")
          .in("id", userIds);
        profileByUser = Object.fromEntries(
          (profs ?? []).map((p: any) => [
            p.id,
            { email: p.email ?? null, name: p.display_name ?? p.username ?? null },
          ]),
        );
      }
      const enriched = (data ?? []).map((m: any) => ({ ...m,
        user_email: profileByUser[m.user_id]?.email ?? null,
        user_name: profileByUser[m.user_id]?.name ?? null }));

      const counts = {
        total: enriched.length,
        digital: enriched.filter((m: any) => m.tier === "digital").length,
        physical: enriched.filter((m: any) => m.tier === "physical").length,
        pending_shipping: enriched.filter(
          (m: any) => m.tier === "physical" && m.shipping_status === "pending",
        ).length };

      return new Response(JSON.stringify({ items: enriched, counts }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }


    if (action === "mark_shipped") {
      const { membershipId, trackingNumber } = body;
      if (!membershipId) throw new Error("membershipId required");
      const { data: m, error } = await admin
        .from("club_memberships")
        .update({ shipping_status: "shipped",
          tracking_number: trackingNumber ?? null,
          shipped_at: new Date().toISOString() })
        .eq("id", membershipId)
        .select("user_id")
        .maybeSingle();
      if (error) throw error;

      if (m) {
        await admin.from("notifications").insert({
          user_id: (m as any).user_id,
          type: "club_card_shipped",
          title: "📮 Your Unique VIP card is on the way!",
          message: trackingNumber
            ? `Tracking: ${trackingNumber}`
            : "Your card should arrive within 5–21 business days." });
      }
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "mark_delivered") {
      const { membershipId } = body;
      if (!membershipId) throw new Error("membershipId required");
      const { data: m, error } = await admin
        .from("club_memberships")
        .update({ shipping_status: "delivered",
          delivered_at: new Date().toISOString() })
        .eq("id", membershipId)
        .select("user_id")
        .maybeSingle();
      if (error) throw error;
      if (m) { await admin.from("notifications").insert({
          user_id: (m as any).user_id,
          type: "club_card_delivered",
          title: "🎉 Your VIP card was delivered",
          message: "Tap it to any NFC phone to open your Unique profile." });
      }
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    throw new Error("Unknown action");
  } catch (e) {
    console.error("[admin-club-shipping]", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
