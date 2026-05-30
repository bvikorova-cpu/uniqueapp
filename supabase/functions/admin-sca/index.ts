import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Early auth pre-check (returns 401 instead of crashing inside try → 500)
  const _earlyAuth = req.headers.get("Authorization");
  if (!_earlyAuth || !_earlyAuth.toLowerCase().startsWith("bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: uErr } = await supabase.auth.getUser(token);
    if (uErr) throw new Error(uErr.message);
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");
    if (!roles || roles.length === 0) throw new Error("Admin only");

    const since = new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString();
    const { data: rows, error } = await supabase
      .from("sca_pending_actions")
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);

    const list = rows ?? [];
    const pending = list.filter((r) => r.status === "requires_action");
    const confirmed = list.filter((r) => r.status === "confirmed");
    const abandoned = list.filter((r) => r.status === "abandoned" || r.status === "expired");

    const totalAtRisk = pending.reduce((s, r) => s + (r.amount_cents ?? 0), 0);
    const totalConfirmedAmt = confirmed.reduce((s, r) => s + (r.amount_cents ?? 0), 0);
    const successRate = list.length > 0 ? (confirmed.length / list.length) * 100 : 0;

    await supabase.from("admin_audit_log").insert({
      admin_id: user.id,
      action: "view_sca_dashboard",
      details: { count: list.length },
    }).then(() => {}, () => {});

    return new Response(
      JSON.stringify({
        kpis: {
          pending_count: pending.length,
          confirmed_count: confirmed.length,
          abandoned_count: abandoned.length,
          at_risk_cents: totalAtRisk,
          confirmed_cents: totalConfirmedAmt,
          success_rate: successRate,
        },
        rows: list,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
