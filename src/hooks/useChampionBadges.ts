import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ChampionBadge = {
  user_id: string;
  module: "kitchenstars" | "reel_battles" | "megatalent";
  rank: number;
  period: string;
  perks: string[];
  badge_expires_at: string;
};

/** Monthly champion rewards, identical in KitchenStars, Reel Battles and MegaTalent. */
export const CHAMPION_REWARDS = [
  {
    rank: 1,
    title: "King",
    credits: 5000,
    perks: ["Gold badge for 30 days", "Gold name everywhere", "Gold framed videos"],
  },
  { rank: 2, title: "Runner-up", credits: 2500, perks: ["Silver badge for 30 days", "T-shirt", "Cap"] },
  { rank: 3, title: "Third place", credits: 1000, perks: ["Bronze badge for 30 days"] },
] as const;

export const championRankClasses = (rank?: number | null) => {
  if (rank === 1) return { text: "text-yellow-500", ring: "ring-2 ring-yellow-400", border: "border-yellow-400" };
  if (rank === 2) return { text: "text-slate-400", ring: "ring-2 ring-slate-300", border: "border-slate-300" };
  if (rank === 3) return { text: "text-amber-700", ring: "ring-2 ring-amber-600", border: "border-amber-600" };
  return { text: "", ring: "", border: "" };
};

/**
 * Loads active champion badges for a list of users (one query, cached per id set).
 * Badges expire automatically 30 days after the month they were won.
 */
export function useChampionBadges(userIds: (string | null | undefined)[]) {
  const key = useMemo(
    () => Array.from(new Set(userIds.filter(Boolean) as string[])).sort().join(","),
    [userIds],
  );
  const [badges, setBadges] = useState<Record<string, ChampionBadge>>({});

  const load = useCallback(async () => {
    const ids = key ? key.split(",") : [];
    if (ids.length === 0) {
      setBadges({});
      return;
    }
    const { data } = await supabase
      .from("battle_monthly_champions")
      .select("user_id, module, rank, period, perks, badge_expires_at")
      .in("user_id", ids)
      .gt("badge_expires_at", new Date().toISOString())
      .order("rank", { ascending: true });

    const map: Record<string, ChampionBadge> = {};
    ((data as ChampionBadge[]) || []).forEach((b) => {
      if (!map[b.user_id] || b.rank < map[b.user_id].rank) map[b.user_id] = b;
    });
    setBadges(map);
  }, [key]);

  useEffect(() => {
    void load();
  }, [load]);

  return badges;
}

/** Convenience hook for a single user. */
export function useChampionBadge(userId?: string | null) {
  const badges = useChampionBadges([userId]);
  return userId ? badges[userId] ?? null : null;
}
