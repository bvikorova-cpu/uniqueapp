// Thin compatibility shim: returns dunning status for current user.
// Standalone so the DunningBanner doesn't depend on the lazy proxy patcher.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ has_dunning: false, unauthenticated: true });
    }
    const { data: userData, error: userErr } = await sb.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userErr || !userData.user) {
      return json({ has_dunning: false, auth_unavailable: true });
    }
    const { data: rows, error } = await sb
      .from("dunning_events")
      .select("*")
      .eq("user_id", userData.user.id)
      .in("kind", ["failed", "requires_action"])
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) return json({ has_dunning: false, check_unavailable: true });
    const dunning = rows?.[0] ?? null;
    return json({ has_dunning: !!dunning, dunning });
  } catch (e) {
    console.error("[check-dunning]", e instanceof Error ? e.message : e);
    return json({ has_dunning: false, check_unavailable: true });
  }
});
