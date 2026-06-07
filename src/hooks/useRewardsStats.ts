import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RewardsStats {
  level: number;
  totalXP: number;
  currentLevelXP: number;
  streak: number;
  longestStreak: number;
  badges: number;
}

/**
 * Live rewards stats for the currently authenticated user.
 * Reads from `user_points` (level, total_points, login_streak, longest_streak) and counts `user_badges`.
 * No mock data — returns zeros when the user has nothing yet.
 */
export function useRewardsStats(userId: string | undefined) {
  return useQuery({
    queryKey: ["rewards-stats", userId],
    enabled: !!userId,
    queryFn: async (): Promise<RewardsStats> => {
      const [pointsRes, badgesRes, loginStreakRes] = await Promise.all([
        (supabase as any)
          .from("user_points")
          .select("total_points, level, current_level_points, login_streak, longest_streak")
          .eq("user_id", userId!)
          .maybeSingle(),
        supabase
          .from("user_badges")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId!),
        (supabase as any)
          .from("user_login_streaks")
          .select("current_streak, longest_streak")
          .eq("user_id", userId!)
          .maybeSingle(),
      ]);

      const p = pointsRes.data as { total_points?: number; level?: number; current_level_points?: number; login_streak?: number; longest_streak?: number } | null;
      const ls = loginStreakRes.data as { current_streak?: number; longest_streak?: number } | null;
      // Take MAX across both stores so the day-of-login value never shows 0
      // just because the legacy `user_points.login_streak` wasn't updated yet.
      const currentStreak = Math.max(p?.login_streak ?? 0, ls?.current_streak ?? 0);
      const longestStreak = Math.max(
        p?.longest_streak ?? 0,
        ls?.longest_streak ?? 0,
        currentStreak,
      );
      return {
        level: p?.level ?? 1,
        totalXP: p?.total_points ?? 0,
        currentLevelXP: p?.current_level_points ?? 0,
        streak: currentStreak,
        longestStreak,
        badges: badgesRes.count ?? 0,
      };
    },
    staleTime: 30_000,
  });
}
