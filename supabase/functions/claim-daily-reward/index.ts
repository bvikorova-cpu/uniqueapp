import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateUser } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { supabase: supabaseClient, user } = await authenticateUser(req);

    // Atomic single-call claim — handles streak, double-claim guard and
    // user_points update inside one transaction. Eliminates the previous
    // TOCTOU race that allowed double-XP under concurrent requests.
    // Pass user id explicitly since service-role client has no auth.uid().
    const { data, error } = await (supabaseClient as any).rpc("claim_daily_reward_atomic", { _user_id: user.id });
    if (error) throw error;

    const payload = data as { ok: boolean; error?: string; pointsEarned?: number; streak?: number };

    if (!payload?.ok) {
      const code = payload?.error ?? "unknown";
      const status = code === "already_claimed" ? 400 : code === "unauthenticated" ? 401 : 400;
      const msg = code === "already_claimed" ? "Already claimed today" : code;
      return new Response(
        JSON.stringify({ error: msg, code }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        pointsEarned: payload.pointsEarned,
        streak: payload.streak,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error claiming daily reward:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
