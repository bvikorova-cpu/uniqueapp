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
      { auth: { persistSession: false } }
    );
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const user = userData.user;
    if (!user?.id) throw new Error("Not authenticated");
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Access denied" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    const since = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
    const [{ data: cfg }, { data: pauses }] = await Promise.all([
      supabase.from("subscription_pause_config").select("*").eq("id", 1).single(),
      supabase
        .from("subscription_pause_log")
        .select("user_id, user_email, paused_at, resumes_at, months, stripe_subscription_id")
        .gte("paused_at", since)
        .order("paused_at", { ascending: false })
        .limit(500),
    ]);

    // Aggregate per user
    const byUser: Record<string, { email: string; count: number; lastPaused: string }> = {};
    (pauses ?? []).forEach((p: any) => {
      if (!byUser[p.user_id]) {
        byUser[p.user_id] = { email: p.user_email, count: 0, lastPaused: p.paused_at };
      }
      byUser[p.user_id].count += 1;
    });
    const topUsers = Object.entries(byUser)
      .map(([user_id, v]) => ({ user_id, ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50);

    const totalPauses = pauses?.length ?? 0;
    const uniqueUsers = Object.keys(byUser).length;
    const atLimit = topUsers.filter((u) => u.count >= (cfg?.max_pauses_per_year ?? 3)).length;

    await supabase.from("admin_audit_log").insert({
      admin_id: user.id,
      action: "pause_overview_viewed",
      details: { totalPauses, uniqueUsers },
    });

    return new Response(
      JSON.stringify({
        config: cfg,
        kpis: { totalPauses, uniqueUsers, atLimit },
        topUsers,
        recent: pauses?.slice(0, 100) ?? [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
