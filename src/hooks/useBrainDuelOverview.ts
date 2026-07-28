import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2500, 4000, 6000, 10000];

const levelFromXp = (xp: number) => {
  let level = 1;
  LEVEL_THRESHOLDS.forEach((t, i) => {
    if (xp >= t) level = i + 1;
  });
  return level;
};

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

/** Computes current / longest daily streak from a set of activity day keys. */
const computeStreaks = (days: Set<string>) => {
  const sorted = Array.from(days).sort();
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of sorted) {
    if (prev) {
      const diff = (new Date(d).getTime() - new Date(prev).getTime()) / 86400000;
      run = diff === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    prev = d;
  }

  const today = dayKey(new Date());
  const yesterday = dayKey(new Date(Date.now() - 86400000));
  let current = 0;
  if (days.has(today) || days.has(yesterday)) {
    let cursor = days.has(today) ? new Date() : new Date(Date.now() - 86400000);
    while (days.has(dayKey(cursor))) {
      current += 1;
      cursor = new Date(cursor.getTime() - 86400000);
    }
  }

  return { current, longest: Math.max(longest, current), todayPlayed: days.has(today) };
};

export interface BrainDuelOverview {
  xp: number;
  level: number;
  elo: number;
  wins: number;
  losses: number;
  currentStreak: number;
  longestStreak: number;
  todayPlayed: boolean;
}

export const useBrainDuelOverview = () => {
  return useQuery({
    queryKey: ["brain-duel-overview"],
    staleTime: 30_000,
    queryFn: async (): Promise<BrainDuelOverview> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { xp: 0, level: 1, elo: 1000, wins: 0, losses: 0, currentStreak: 0, longestStreak: 0, todayPlayed: false };
      }

      const [eloRes, matchRes, challengeRes] = await Promise.all([
        supabase.from("brain_duel_elo").select("rating, wins, losses").eq("user_id", user.id).maybeSingle(),
        supabase
          .from("brain_duel_matches")
          .select("player1_id, player2_id, player1_score, player2_score, winner_id, created_at, status")
          .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
          .eq("status", "finished")
          .order("created_at", { ascending: false })
          .limit(500),
        supabase
          .from("brain_duel_daily_challenge_entries")
          .select("completed_at, score")
          .eq("user_id", user.id)
          .order("completed_at", { ascending: false })
          .limit(180),
      ]);

      const matches = matchRes.data ?? [];
      const entries = challengeRes.data ?? [];

      const matchWins = matches.filter((m: any) => m.winner_id === user.id).length;
      const matchLosses = matches.filter((m: any) => m.winner_id && m.winner_id !== user.id).length;

      const matchXp = matches.reduce((sum: number, m: any) => {
        const score = m.player1_id === user.id ? m.player1_score : m.player2_score;
        return sum + (score || 0) + (m.winner_id === user.id ? 25 : 5);
      }, 0);
      const challengeXp = entries.reduce((sum: number, e: any) => sum + (e.score || 0) * 5, 0);
      const xp = matchXp + challengeXp;

      const days = new Set<string>();
      matches.forEach((m: any) => days.add(dayKey(new Date(m.created_at))));
      entries.forEach((e: any) => { if (e.completed_at) days.add(dayKey(new Date(e.completed_at))); });
      const { current, longest, todayPlayed } = computeStreaks(days);

      return {
        xp,
        level: levelFromXp(xp),
        elo: eloRes.data?.rating ?? 1000,
        wins: eloRes.data?.wins ?? matchWins,
        losses: eloRes.data?.losses ?? matchLosses,
        currentStreak: current,
        longestStreak: longest,
        todayPlayed,
      };
    },
  });
};
