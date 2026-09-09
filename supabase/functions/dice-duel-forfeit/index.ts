import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const fail = (msg: string, status = 400) =>
    new Response(JSON.stringify({ error: msg }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return fail("No authorization header", 401);
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) return fail("Not authenticated", 401);

    const body = await req.json().catch(() => ({}));
    const matchId = typeof body?.match_id === "string" ? body.match_id : null;
    if (!matchId) return fail("match_id required");

    const { data: m } = await supabase.from("dice_duel_matches").select("*").eq("id", matchId).maybeSingle();
    if (!m) return fail("Match not found", 404);
    if (user.id !== m.player1_id && user.id !== m.player2_id) return fail("Not your match", 403);

    if (m.status === "waiting") {
      if (m.player1_id !== user.id) return fail("Only the creator can cancel");
      await supabase.from("dice_duel_matches")
        .update({ status: "abandoned", finished_at: new Date().toISOString() })
        .eq("id", matchId).eq("status", "waiting");
      await supabase.rpc("battle_coins_apply", {
        _user_id: user.id, _module: "dice_duel", _delta: m.stake ?? 100,
        _reason: "duel_entry_refund", _source: "dice_duel", _ref_id: matchId,
      });
      return new Response(JSON.stringify({ ok: true, cancelled: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (m.status !== "active") return fail("Match already finished");

    const winner = user.id === m.player1_id ? m.player2_id : m.player1_id;
    const { data: updated, error: upErr } = await supabase
      .from("dice_duel_matches")
      .update({
        status: "finished",
        winner_id: winner,
        finished_at: new Date().toISOString(),
        current_turn: null,
      })
      .eq("id", matchId)
      .eq("status", "active")
      .select()
      .maybeSingle();
    if (upErr || !updated) return fail("Could not finish match", 409);

    // Skill-game reward: winner takes 160 Battle Coins (80% of the 200-coin pot) + XP.
    const prize = 160;
    if (winner) {
      await supabase.rpc("battle_coins_apply", {
        _user_id: winner, _module: "dice_duel", _delta: prize,
        _reason: "duel_win_forfeit", _source: "dice_duel", _ref_id: matchId,
      });
      await supabase.rpc("award_xp", {
        _user_id: winner, _amount: 10, _source: "dice_duel", _ref_id: matchId,
      });
    }

    return new Response(JSON.stringify({ ok: true, match: updated, winner_id: winner }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("dice-duel-forfeit error", e);
    return fail(e instanceof Error ? e.message : "Internal error", 500);
  }
});
