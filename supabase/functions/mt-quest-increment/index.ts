// Megatalent: increment daily quest progress for the authenticated user.
// Body: { quest_key: string, amount?: number }
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth header");
    const { data: udata, error: uerr } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (uerr || !udata.user) throw new Error("Not authenticated");
    const user = udata.user;

    const { quest_key, amount } = await req.json();
    if (!quest_key || typeof quest_key !== "string") throw new Error("quest_key required");
    const inc = Math.max(1, Math.min(100, Number(amount) || 1));

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // Rate limit: max 30 increments per 10s per user (across all quests)
    const { data: allowed } = await admin.rpc("mt_rate_limit_check", {
      _user_id: user.id,
      _action: "quest_increment",
      _window_seconds: 10,
      _max_count: 30,
    });
    if (allowed === false) {
      return new Response(JSON.stringify({ error: "rate_limited" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }

    const { data: quest, error: qerr } = await admin
      .from("mt_daily_quests")
      .select("quest_key, target_count, active")
      .eq("quest_key", quest_key)
      .maybeSingle();
    if (qerr || !quest || !quest.active) throw new Error("Quest not found");

    const today = new Date().toISOString().slice(0, 10);
    const { data: existing } = await admin
      .from("mt_user_quest_progress")
      .select("id, progress, completed_at")
      .eq("user_id", user.id)
      .eq("quest_key", quest_key)
      .eq("quest_date", today)
      .maybeSingle();

    const newProgress = Math.min(quest.target_count, ((existing?.progress ?? 0) + inc));
    const completed = newProgress >= quest.target_count;
    const completed_at = completed && !existing?.completed_at ? new Date().toISOString() : existing?.completed_at;

    if (existing) {
      await admin.from("mt_user_quest_progress").update({ progress: newProgress, completed_at }).eq("id", existing.id);
    } else {
      await admin.from("mt_user_quest_progress").insert({
        user_id: user.id, quest_key, quest_date: today, progress: newProgress, completed_at,
      });
    }

    return new Response(JSON.stringify({ ok: true, progress: newProgress, completed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[mt-quest-increment]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
