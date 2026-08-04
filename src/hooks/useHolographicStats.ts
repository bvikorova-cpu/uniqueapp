import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface HolographicStats {
  avatars: number;
  battles: number;
  wins: number;
  losses: number;
  draws: number;
  breedings: number;
  rareOffspring: number;
  restyles: number;
  xp: number;
  level: number;
  nextLevelXp: number;
  progressToNextLevel: number;
  winRate: number;
  interactions: number;
  styles: string[];
  lastActivity: string | null;
}

const EMPTY: HolographicStats = {
  avatars: 0, battles: 0, wins: 0, losses: 0, draws: 0, breedings: 0,
  rareOffspring: 0, restyles: 0, xp: 0, level: 1, nextLevelXp: 500,
  progressToNextLevel: 0, winRate: 0, interactions: 0, styles: [], lastActivity: null,
};

// XP thresholds mirror the evolution stages shown in the Evolution Lab.
export const EVOLUTION_THRESHOLDS = [0, 500, 2000, 10000, 50000, 200000];

export const levelFromXp = (xp: number) => {
  let level = 1;
  for (let i = 0; i < EVOLUTION_THRESHOLDS.length; i++) {
    if (xp >= EVOLUTION_THRESHOLDS[i]) level = [1, 10, 25, 50, 75, 100][i];
  }
  return level;
};

const nextThreshold = (xp: number) =>
  EVOLUTION_THRESHOLDS.find((t) => t > xp) ?? EVOLUTION_THRESHOLDS[EVOLUTION_THRESHOLDS.length - 1];

export function useHolographicStats() {
  const [stats, setStats] = useState<HolographicStats>(EMPTY);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setStats(EMPTY); return; }
      const uid = session.user.id;

      const [avatarsRes, battlesRes, breedRes] = await Promise.all([
        supabase.from("holographic_avatars").select("style, created_at").eq("user_id", uid),
        supabase.from("holographic_battle_results").select("outcome, created_at").eq("user_id", uid),
        supabase.from("holographic_breeding_results").select("rarity, created_at").eq("user_id", uid),
      ]);

      const avatars = avatarsRes.data ?? [];
      const battles = battlesRes.data ?? [];
      const breedings = breedRes.data ?? [];

      const wins = battles.filter((b) => b.outcome === "win").length;
      const losses = battles.filter((b) => b.outcome === "loss").length;
      const draws = battles.length - wins - losses;
      const rareOffspring = breedings.filter((b) =>
        ["rare", "epic", "legendary"].includes(String(b.rarity ?? "").toLowerCase())).length;

      // XP is derived deterministically from real activity — no fabricated values.
      const xp = avatars.length * 120 + wins * 150 + draws * 60 + losses * 40 + breedings.length * 200 + rareOffspring * 150;
      const nextLevelXp = nextThreshold(xp);
      const prev = [...EVOLUTION_THRESHOLDS].reverse().find((t) => t <= xp) ?? 0;
      const progressToNextLevel = nextLevelXp > prev
        ? Math.min(100, Math.round(((xp - prev) / (nextLevelXp - prev)) * 100))
        : 100;

      const timestamps = [...avatars, ...battles, ...breedings]
        .map((r: any) => r.created_at)
        .filter(Boolean)
        .sort();

      setStats({
        avatars: avatars.length,
        battles: battles.length,
        wins, losses, draws,
        breedings: breedings.length,
        rareOffspring,
        restyles: 0,
        xp,
        level: levelFromXp(xp),
        nextLevelXp,
        progressToNextLevel,
        winRate: battles.length ? Math.round((wins / battles.length) * 100) : 0,
        interactions: avatars.length + battles.length + breedings.length,
        styles: Array.from(new Set(avatars.map((a) => a.style).filter(Boolean) as string[])),
        lastActivity: timestamps.length ? timestamps[timestamps.length - 1] : null,
      });
    } catch (e) {
      console.error("useHolographicStats", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { stats, loading, refresh: load };
}
