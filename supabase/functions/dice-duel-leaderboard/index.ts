import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// Global Dice Trail Duel leaderboard.
// Scoring: 1 point per win, 0 points per loss.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: rows, error } = await supabase
      .from("dice_duel_matches")
      .select("player1_id, player2_id, winner_id, finished_at")
      .eq("status", "finished")
      .not("winner_id", "is", null)
      .order("finished_at", { ascending: false })
      .limit(5000);

    if (error) return json({ error: error.message }, 500);

    const stats = new Map<string, { wins: number; losses: number }>();
    const bump = (id: string | null, won: boolean) => {
      if (!id) return;
      const s = stats.get(id) ?? { wins: 0, losses: 0 };
      if (won) s.wins += 1; else s.losses += 1;
      stats.set(id, s);
    };

    for (const m of rows ?? []) {
      bump(m.player1_id, m.winner_id === m.player1_id);
      bump(m.player2_id, m.winner_id === m.player2_id);
    }

    const ids = [...stats.keys()];
    let profiles: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", ids);
      for (const p of profs ?? []) {
        profiles[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url };
      }
    }

    const leaderboard = ids
      .map((id) => {
        const s = stats.get(id)!;
        return {
          user_id: id,
          display_name: profiles[id]?.full_name ?? "Player",
          avatar_url: profiles[id]?.avatar_url ?? null,
          points: s.wins, // 1 point per win, 0 per loss
          wins: s.wins,
          losses: s.losses,
          matches: s.wins + s.losses };
      })
      .sort((a, b) => b.points - a.points || a.losses - b.losses || b.matches - a.matches)
      .slice(0, 50)
      .map((r, i) => ({ ...r, rank: i + 1 }));

    return json({ leaderboard });
  } catch (e) {
    return json({ error: (e as Error)?.message ?? "unexpected" }, 500);
  }
});
