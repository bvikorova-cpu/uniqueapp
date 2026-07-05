import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EducationStats {
  currentXP: number;
  currentStreak: number;
  bestStreak: number;
  todayCompleted: boolean;
}

/**
 * Pulls live education stats for the current user:
 *  - currentXP from `user_points.total_points`
 *  - login_streak as the daily challenge streak proxy
 *  - todayCompleted = education daily completion for today
 *  - bestStreak = `user_points.longest_streak`
 */
export const useEducationStats = () => {
  return useQuery({
    queryKey: ["education-stats"],
    queryFn: async (): Promise<EducationStats> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { currentXP: 0, currentStreak: 0, bestStreak: 0, todayCompleted: false };
      }

      const today = new Date().toISOString().slice(0, 10);

      const [{ data: points }, { data: todayCompletions }] = await Promise.all([
        supabase
          .from("user_points")
          .select("total_points, login_streak, longest_streak")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("education_daily_completions")
          .select("id, education_daily_challenges!inner(challenge_date)")
          .eq("user_id", user.id)
          .eq("education_daily_challenges.challenge_date", today)
          .limit(1),
      ]);

      const todayCompleted = (todayCompletions?.length ?? 0) > 0;
      const currentStreak = Math.max(points?.login_streak ?? 0, todayCompleted ? 1 : 0);
      return {
        currentXP: points?.total_points ?? 0,
        currentStreak,
        bestStreak: Math.max(points?.longest_streak ?? 0, currentStreak),
        todayCompleted,
      };
    },
    staleTime: 60_000,
  });
};

export interface EducationLeaderRow {
  user_id: string;
  total_points: number;
  full_name: string | null;
  avatar_url: string | null;
}

export const useEducationLeaderboard = () => {
  return useQuery({
    queryKey: ["education-leaderboard"],
    queryFn: async (): Promise<EducationLeaderRow[]> => {
      const { data: top } = await supabase
        .from("user_points")
        .select("user_id, total_points")
        .order("total_points", { ascending: false })
        .limit(10);
      if (!top || top.length === 0) return [];

      const userIds = top.map((t) => t.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      return top.map((row) => {
        const profile = profiles?.find((p) => p.id === row.user_id);
        return {
          user_id: row.user_id,
          total_points: row.total_points ?? 0,
          full_name: profile?.full_name ?? null,
          avatar_url: profile?.avatar_url ?? null,
        };
      });
    },
    staleTime: 60_000,
  });
};
