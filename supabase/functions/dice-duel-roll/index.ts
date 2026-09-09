import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const COLS = 9;   // x: 0..8
const ROWS = 14;  // y: 0..13, bottom row wins
// Dice direction map (from the video): 1=↓ 2=↗ 3=↘ 4=← 5=↙ 6=↓
const DIRS: Record<number, [number, number]> = {
  1: [0, 1],
  2: [1, -1],
  3: [1, 1],
  4: [-1, 0],
  5: [-1, 1],
  6: [0, 1],
};

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
    if (m.status !== "active") return fail("Match is not active");
    if (user.id !== m.player1_id && user.id !== m.player2_id) return fail("Not your match", 403);
    if (m.current_turn !== user.id) return fail("Not your turn");

    // Fair server-side roll
    const roll = 1 + Math.floor(Math.random() * 6);
    const isP1 = user.id === m.player1_id;
    const trail: [number, number][] = Array.isArray(isP1 ? m.p1_trail : m.p2_trail)
      ? (isP1 ? m.p1_trail : m.p2_trail)
      : [];
    const [cx, cy] = trail[trail.length - 1] ?? [isP1 ? 3 : 5, 0];
    const [dx, dy] = DIRS[roll];
    const nx = cx + dx;
    const ny = cy + dy;

    const inBounds = nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS;
    const newTrail = inBounds ? [...trail, [nx, ny]] : trail;
    const won = inBounds && ny === ROWS - 1;

    const update: Record<string, unknown> = {
      last_roll: roll,
      [isP1 ? "p1_trail" : "p2_trail"]: newTrail,
    };

    if (won) {
      update.status = "finished";
      update.winner_id = user.id;
      update.finished_at = new Date().toISOString();
      update.current_turn = null;
    } else {
      update.current_turn = isP1 ? m.player2_id : m.player1_id;
    }

    // Guard against double-roll race: only apply if still my turn
    const { data: updated, error: upErr } = await supabase
      .from("dice_duel_matches")
      .update(update)
      .eq("id", matchId)
      .eq("current_turn", user.id)
      .select()
      .maybeSingle();
    if (upErr || !updated) return fail("Turn already played", 409);

    if (won) {
      // Winner takes 160 Battle Coins (80% of the 200-coin pot) + XP. Coins never convert back.
      await supabase.rpc("battle_coins_apply", {
        _user_id: user.id, _module: "dice_duel", _delta: 160,
        _reason: "duel_win", _source: "dice_duel", _ref_id: matchId,
      });
      await supabase.rpc("award_xp", {
        _user_id: user.id, _amount: 10, _source: "dice_duel", _ref_id: matchId,
      });
    }

    return new Response(JSON.stringify({
      ok: true,
      roll,
      moved: inBounds,
      won,
      match: updated,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("dice-duel-roll error", e);
    return fail(e instanceof Error ? e.message : "Internal error", 500);
  }
});

export const _internals = { DIRS, COLS, ROWS };
