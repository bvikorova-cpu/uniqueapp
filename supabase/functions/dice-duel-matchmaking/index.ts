import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

/** Battle Coins economy: entry 100 coins (= 1 AI credit exchanged), winner takes 160 coins + XP. */
const MODULE = "dice_duel";
const STAKE = 100;
const COLS = 9;
const START_P1 = [3, 0];
const START_P2 = [5, 0];

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

    const coins = async (userId: string, delta: number, reason: string, refId?: string) => {
      const { error } = await supabase.rpc("battle_coins_apply", {
        _user_id: userId, _module: MODULE, _delta: delta,
        _reason: reason, _source: MODULE, _ref_id: refId ?? null,
      });
      return !error;
    };

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return fail("No authorization header", 401);
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) return fail("Not authenticated", 401);

    const body = await req.json().catch(() => ({}));
    const action = body?.action === "cancel" ? "cancel" : "find";

    // ---- Cancel a waiting match (refund entry coins) ----
    if (action === "cancel") {
      const matchId = typeof body?.match_id === "string" ? body.match_id : null;
      if (!matchId) return fail("match_id required");
      const { data: m } = await supabase.from("dice_duel_matches").select("*").eq("id", matchId).maybeSingle();
      if (!m || m.player1_id !== user.id) return fail("Match not found");
      if (m.status !== "waiting") return fail("Match already started");
      await supabase.from("dice_duel_matches").update({ status: "abandoned", finished_at: new Date().toISOString() }).eq("id", matchId);
      await coins(user.id, m.stake ?? STAKE, "duel_entry_refund", matchId);
      return new Response(JSON.stringify({ ok: true, cancelled: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ---- Leave any other stale waiting matches of this user ----
    await supabase.from("dice_duel_matches")
      .update({ status: "abandoned", finished_at: new Date().toISOString() })
      .eq("player1_id", user.id).eq("status", "waiting")
      .lt("created_at", new Date(Date.now() - 30 * 60 * 1000).toISOString());

    // ---- Try to join an existing waiting match ----
    const { data: waiting } = await supabase
      .from("dice_duel_matches")
      .select("*")
      .eq("status", "waiting")
      .neq("player1_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (waiting) {
      // Creator already paid on creation — only the joining player pays now.
      const paid = await coins(user.id, -(waiting.stake ?? STAKE), "duel_entry", waiting.id);
      if (!paid) return fail(`You need ${waiting.stake ?? STAKE} Battle Coins to play`, 402);

      const { data: joined, error: joinErr } = await supabase
        .from("dice_duel_matches")
        .update({
          player2_id: user.id,
          status: "active",
          current_turn: waiting.player1_id,
          started_at: new Date().toISOString(),
        })
        .eq("id", waiting.id)
        .eq("status", "waiting")
        .select()
        .maybeSingle();
      if (joinErr || !joined) {
        await coins(user.id, waiting.stake ?? STAKE, "duel_entry_refund", waiting.id);
        return fail("Match is no longer available");
      }
      return new Response(JSON.stringify({ ok: true, match: joined, joined: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ---- Create a new waiting match ----
    const { data: wallet } = await supabase
      .from("battle_coins").select("balance")
      .eq("user_id", user.id).eq("module", MODULE).maybeSingle();
    if ((wallet?.balance ?? 0) < STAKE) {
      return fail(`You need ${STAKE} Battle Coins to play`, 402);
    }
    const paid = await coins(user.id, -STAKE, "duel_entry");
    if (!paid) return fail(`You need ${STAKE} Battle Coins to play`, 402);

    const { data: match, error: insErr } = await supabase
      .from("dice_duel_matches")
      .insert({
        player1_id: user.id,
        status: "waiting",
        stake: STAKE,
        p1_trail: [START_P1],
        p2_trail: [START_P2],
      })
      .select()
      .single();
    if (insErr || !match) {
      await coins(user.id, STAKE, "duel_entry_refund");
      console.error("dice duel insert failed", insErr);
      return fail("Could not create match", 500);
    }

    return new Response(JSON.stringify({ ok: true, match, joined: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("dice-duel-matchmaking error", e);
    return fail(e instanceof Error ? e.message : "Internal error", 500);
  }
});

export const _internals = { STAKE, COLS, START_P1, START_P2, MODULE };
