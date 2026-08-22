// Provider inbox: list appointments for the authenticated provider.
// Body: { filter: 'upcoming'|'past'|'cancelled'|'all' } (default upcoming)
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authentication required");
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const { data: userData } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    const body = await req.json().catch(() => ({}));
    const filter = body.filter || "upcoming";
    const allowed = ["upcoming", "past", "cancelled", "all"];
    if (!allowed.includes(filter)) throw new Error("Invalid filter");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    let query = admin
      .from("service_bookings")
      .select("id, provider_id, customer_id, scheduled_at, duration_minutes, status, price_cents, customer_notes, offering_name, created_at")
      .eq("provider_id", user.id);

    if (filter === "upcoming") {
      query = query
        .in("status", ["pending_payment", "confirmed", "completed"])
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at", { ascending: true });
    } else if (filter === "past") {
      query = query
        .in("status", ["completed", "confirmed"])
        .lt("scheduled_at", new Date().toISOString())
        .order("scheduled_at", { ascending: false });
    } else if (filter === "cancelled") {
      query = query
        .in("status", ["cancelled_by_customer", "cancelled_by_provider", "refunded", "no_show"])
        .order("scheduled_at", { ascending: false });
    } else {
      query = query.order("scheduled_at", { ascending: false });
    }

    const { data: bookings, error } = await query;
    if (error) throw new Error(error.message);

    const customerIds = Array.from(new Set((bookings ?? []).map((b) => b.customer_id)));
    const profiles: Record<string, { email?: string; full_name?: string; avatar_url?: string }> = {};
    if (customerIds.length) {
      const { data: users } = await admin.auth.admin.getUsers({ ids: customerIds });
      const { data: profs } = await admin
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", customerIds);
      const profMap = new Map((profs ?? []).map((p: any) => [p.id, p]));
      for (const u of users?.users ?? []) {
        const p = profMap.get(u.id);
        profiles[u.id] = { email: u.email, full_name: p?.full_name, avatar_url: p?.avatar_url };
      }
    }

    const rows = (bookings ?? []).map((b) => ({ ...b, customer: profiles[b.customer_id] ?? null }));
    return new Response(JSON.stringify({ rows }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("service-provider-inbox error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
