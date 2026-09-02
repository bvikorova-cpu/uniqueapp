import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { liveStreak } from "@/lib/streakUtils";

export interface WallStreakWeekDay {
  day_date: string;
  is_active: boolean;
  xp_earned: number;
}

export interface WallStreakData {
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  lastActiveDate: string | null;
  week: WallStreakWeekDay[];
}

const EMPTY: WallStreakData = {
  currentStreak: 0,
  longestStreak: 0,
  totalXp: 0,
  lastActiveDate: null,
  week: [],
};

/**
 * Real Wall posting streak — reads `user_streaks` (written by the
 * `record_daily_activity` RPC on every post/comment/reaction) plus the
 * `get_streak_week` RPC for the current week's activity grid.
 */
export function useWallStreak() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["wall-streak", user?.id],
    enabled: !!user?.id,
    staleTime: 30_000,
    queryFn: async (): Promise<WallStreakData> => {
      const [rowRes, weekRes] = await Promise.all([
        supabase
          .from("user_streaks")
          .select("current_streak, longest_streak, total_xp, last_active_date")
          .eq("user_id", user!.id)
          .maybeSingle(),
        supabase.rpc("get_streak_week"),
      ]);

      const row = rowRes.data as
        | { current_streak?: number; longest_streak?: number; total_xp?: number; last_active_date?: string | null }
        | null;
      const week = (weekRes.data ?? []) as WallStreakWeekDay[];

      return {
        currentStreak: liveStreak(row?.current_streak ?? 0, row?.last_active_date ?? null),
        longestStreak: Math.max(row?.longest_streak ?? 0, row?.current_streak ?? 0),
        totalXp: row?.total_xp ?? 0,
        lastActiveDate: row?.last_active_date ?? null,
        week,
      };
    },
  });

  // Refresh whenever a post/comment/reaction records daily activity.
  useEffect(() => {
    const handler = () => {
      qc.invalidateQueries({ queryKey: ["wall-streak"] });
    };
    window.addEventListener("streak-updated", handler);
    return () => window.removeEventListener("streak-updated", handler);
  }, [qc]);

  return { data: query.data ?? EMPTY, isLoading: query.isLoading, refetch: query.refetch };
}
