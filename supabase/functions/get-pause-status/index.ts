import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(userError.message);
    const user = userData.user;
    if (!user?.id) throw new Error("Not authenticated");

    const [{ data: cfg }, { data: count }, { data: history }] = await Promise.all([
      supabase
        .from("subscription_pause_config")
        .select("max_pauses_per_year, max_months_per_pause")
        .eq("id", 1)
        .single(),
      supabase.rpc("get_user_pause_count", { _user_id: user.id }),
      supabase
        .from("subscription_pause_log")
        .select("paused_at, resumes_at, months")
        .eq("user_id", user.id)
        .order("paused_at", { ascending: false })
        .limit(10),
    ]);

    const used = (count as number) ?? 0;
    const limit = cfg?.max_pauses_per_year ?? 3;

    return new Response(
      JSON.stringify({
        used,
        limit,
        remaining: Math.max(0, limit - used),
        max_months_per_pause: cfg?.max_months_per_pause ?? 3,
        history: history ?? [],
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
