import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (userError || !user) throw new Error("Unauthorized");

    // Get universes
    const { data: universes, error: universesError } = await supabaseClient
      .from("parallel_universes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (universesError) throw universesError;

    // Get best self versions
    const { data: bestVersions, error: versionsError } = await supabaseClient
      .from("best_self_versions")
      .select(`
        *,
        universe:universe_id(*)
      `)
      .eq("user_id", user.id)
      .order("ranking", { ascending: true });

    if (versionsError) throw versionsError;

    // Get jump history
    const { data: jumps, error: jumpsError } = await supabaseClient
      .from("reality_jumps")
      .select(`
        *,
        from_universe:from_universe_id(universe_name),
        to_universe:to_universe_id(universe_name)
      `)
      .eq("user_id", user.id)
      .order("jumped_at", { ascending: false })
      .limit(10);

    if (jumpsError) throw jumpsError;

    // Get merges
    const { data: merges, error: mergesError } = await supabaseClient
      .from("timeline_merges")
      .select(`
        *,
        result_universe:result_universe_id(*)
      `)
      .eq("user_id", user.id)
      .order("merged_at", { ascending: false });

    if (mergesError) throw mergesError;

    return new Response(
      JSON.stringify({
        success: true,
        universes: universes || [],
        bestVersions: bestVersions || [],
        jumps: jumps || [],
        merges: merges || [],
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in get-user-universes:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
