import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const STAKE = 2;
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return fail("No authorization header", 401);
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) return fail("Not authenticated", 401);

    const body = await req.json().catch(() => ({}));
    const action = body?.action === "cancel" ? "cancel" : "find";

    // ---- Cancel a waiting match (refund stake) ----
    if (action === "cancel") {
      const matchId = typeof body?.match_id === "string" ? body.match_id : null;
      if (!matchId) return fail("match_id required");
      const { data: m } = await supabase.from("dice_duel_matches").select("*").eq("id", matchId).maybeSingle();
      if (!m || m.player1_id !== user.id) return fail("Match not found");
      if (m.status !== "waiting") return fail("Match already started");
      await supabase.from("dice_duel_matches").update({ status: "abandoned", finished_at: new Date().toISOString() }).eq("id", matchId);
      await supabase.rpc("add_ai_credits", {
        p_user_id: user.id, p_amount: m.stake,
        p_reason: "dice_duel_stake_refund", p_source: "dice_duel",
      });
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
      // Deduct stake from both players
      const deducted: string[] = [];
      for (const id of [waiting.player1_id, user.id]) {
        const { data: ok, error: spendErr } = await supabase.rpc("deduct_ai_credits", {
          p_user_id: id, p_amount: waiting.stake,
          p_reason: "dice_duel_stake", p_source: "dice_duel",
        });
        if (spendErr || ok === false) {
          for (const rid of deducted) {
            await supabase.rpc("add_ai_credits", {
              p_user_id: rid, p_amount: waiting.stake,
              p_reason: "dice_duel_stake_refund", p_source: "dice_duel",
            });
          }
          if (id === waiting.player1_id) {
            // challenger can no longer pay — kill that match and let user create own
            await supabase.from("dice_duel_matches").update({ status: "abandoned", finished_at: new Date().toISOString() }).eq("id", waiting.id);
            break;
          }
          return fail(`You need ${waiting.stake} credits to play`);
        }
        deducted.push(id);
      }

      if (deducted.length === 2) {
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
          for (const rid of deducted) {
            await supabase.rpc("add_ai_credits", {
              p_user_id: rid, p_amount: waiting.stake,
              p_reason: "dice_duel_stake_refund", p_source: "dice_duel",
            });
          }
          return fail("Match is no longer available");
        }
        return new Response(JSON.stringify({ ok: true, match: joined, joined: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      // fall through to create own waiting match
    }

    // ---- Create a new waiting match ----
    const { data: balance } = await supabase.from("ai_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    if ((balance?.credits_remaining ?? 0) < STAKE) {
      return fail(`You need ${STAKE} credits to play`, 402);
    }
    const { data: ok, error: spendErr } = await supabase.rpc("deduct_ai_credits", {
      p_user_id: user.id, p_amount: STAKE,
      p_reason: "dice_duel_stake", p_source: "dice_duel",
    });
    if (spendErr || ok === false) return fail("Not enough credits", 402);

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
      await supabase.rpc("add_ai_credits", {
        p_user_id: user.id, p_amount: STAKE,
        p_reason: "dice_duel_stake_refund", p_source: "dice_duel",
      });
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

export const _internals = { STAKE, COLS, START_P1, START_P2 };
