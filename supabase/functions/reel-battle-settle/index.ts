import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Settles expired clip duels:
 *  - participant with most net votes (likes - dislikes) receives the full prize pool in battle coins
 *  - tie / missing opponent -> entry fee refunded to each participant
 *  - the duel and all its rows (participants, votes, comments) are deleted afterwards
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const nowIso = new Date().toISOString();
    const { data: battles, error: be } = await supabase
      .from("reel_battles")
      .select("id, prize_pool, deadline, status")
      .lt("deadline", nowIso)
      .limit(50);
    if (be) throw be;

    const results: Array<Record<string, unknown>> = [];

    for (const battle of battles ?? []) {
      const { data: parts, error: pe } = await supabase
        .from("reel_battle_participants")
        .select("id, user_id, vote_count, dislike_count")
        .eq("battle_id", battle.id);
      if (pe) throw pe;

      const list = parts ?? [];
      const score = (p: { vote_count: number | null; dislike_count: number | null }) =>
        (p.vote_count ?? 0) - (p.dislike_count ?? 0);

      let winnerId: string | null = null;
      let payouts: Array<{ user_id: string; amount: number; reason: string }> = [];

      if (list.length === 2) {
        const [a, b] = list;
        if (score(a) > score(b)) winnerId = a.user_id;
        else if (score(b) > score(a)) winnerId = b.user_id;

        if (winnerId) {
          payouts = [{ user_id: winnerId, amount: Number(battle.prize_pool ?? 200), reason: "battle_win" }];
        } else {
          payouts = list.map((p) => ({ user_id: p.user_id, amount: 100, reason: "battle_refund" }));
        }
      } else if (list.length === 1) {
        payouts = [{ user_id: list[0].user_id, amount: 100, reason: "battle_refund" }];
      }

      for (const payout of payouts) {
        const { error: ce } = await supabase.rpc("battle_coins_apply", {
          _user_id: payout.user_id,
          _module: "reel_battles",
          _delta: payout.amount,
          _reason: payout.reason,
          _source: "reel_battles",
          _ref_id: battle.id,
        });
        if (ce) console.error("payout failed", battle.id, payout, ce.message);
      }

      // Remove the duel entirely
      await supabase.from("reel_battle_votes").delete().eq("battle_id", battle.id);
      await supabase.from("reel_battle_comments").delete().eq("battle_id", battle.id);
      await supabase.from("reel_battle_participants").delete().eq("battle_id", battle.id);
      const { error: de } = await supabase.from("reel_battles").delete().eq("id", battle.id);
      if (de) throw de;

      results.push({ battle_id: battle.id, winner_user_id: winnerId, payouts });
    }

    return new Response(JSON.stringify({ success: true, settled: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("reel-battle-settle error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
