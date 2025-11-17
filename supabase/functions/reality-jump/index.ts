import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const { action, fromUniverseId, toUniverseId, jumpReason } = await req.json();

    if (action === "jump") {
      // Record the jump
      const { data: jump, error: jumpError } = await supabaseClient
        .from("reality_jumps")
        .insert({
          user_id: user.id,
          from_universe_id: fromUniverseId,
          to_universe_id: toUniverseId,
          jump_reason: jumpReason,
          decision_data: {
            timestamp: new Date().toISOString(),
            reason: jumpReason,
          },
        })
        .select()
        .single();

      if (jumpError) throw jumpError;

      return new Response(
        JSON.stringify({ success: true, jump }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else if (action === "get_jumps") {
      // Get user's jump history
      const { data: jumps, error: jumpsError } = await supabaseClient
        .from("reality_jumps")
        .select(`
          *,
          from_universe:from_universe_id(universe_name, success_score),
          to_universe:to_universe_id(universe_name, success_score)
        `)
        .eq("user_id", user.id)
        .order("jumped_at", { ascending: false });

      if (jumpsError) throw jumpsError;

      return new Response(
        JSON.stringify({ success: true, jumps: jumps || [] }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    throw new Error("Invalid action");
  } catch (error) {
    console.error("Error in reality-jump:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
