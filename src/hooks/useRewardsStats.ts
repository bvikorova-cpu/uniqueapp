import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RewardsStats {
  level: number;
  totalXP: number;
  currentLevelXP: number;
  streak: number;
  badges: number;
}

/**
 * Live rewards stats for the currently authenticated user.
 * Reads from `user_points` (level, total_points, login_streak) and counts `user_badges`.
 * No mock data — returns zeros when the user has nothing yet.
 */
export function useRewardsStats(userId: string | undefined) {
  return useQuery({
    queryKey: ["rewards-stats", userId],
    enabled: !!userId,
    queryFn: async (): Promise<RewardsStats> => {
      const [pointsRes, badgesRes] = await Promise.all([
        supabase
          .from("user_points")
          .select("total_points, level, current_level_points, login_streak")
          .eq("user_id", userId!)
          .maybeSingle(),
        supabase
          .from("user_badges")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId!),
      ]);

      const p = pointsRes.data;
      return {
        level: p?.level ?? 1,
        totalXP: p?.total_points ?? 0,
        currentLevelXP: p?.current_level_points ?? 0,
        streak: p?.login_streak ?? 0,
        badges: badgesRes.count ?? 0,
      };
    },
    staleTime: 30_000,
  });
}
