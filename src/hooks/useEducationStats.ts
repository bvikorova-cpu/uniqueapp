import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EducationStats {
  currentXP: number;
  currentStreak: number;
  bestStreak: number;
  todayCompleted: boolean;
}

/**
 * Pulls live education stats for the current user.
 * currentXP is EDUCATION-SPECIFIC (not global platform points), derived from
 * real activity inside the Education Hub:
 *   daily challenge completions (20 XP), completed lessons (15 XP),
 *   exercise submissions (10 XP), math solves (5 XP),
 *   plus educational_progress lessons (10 XP) and stars (5 XP).
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
      const uid = user.id;

      const [
        { data: points },
        { data: todayCompletions },
        { count: dailyCount },
        { count: lessonCount },
        { count: exerciseCount },
        { count: mathCount },
        { data: progressRows },
      ] = await Promise.all([
        supabase
          .from("user_points")
          .select("login_streak, longest_streak")
          .eq("user_id", uid)
          .maybeSingle(),
        supabase
          .from("education_daily_completions")
          .select("id, education_daily_challenges!inner(challenge_date)")
          .eq("user_id", uid)
          .eq("education_daily_challenges.challenge_date", today)
          .limit(1),
        supabase.from("education_daily_completions").select("id", { count: "exact", head: true }).eq("user_id", uid),
        supabase.from("education_lesson_progress").select("id", { count: "exact", head: true }).eq("user_id", uid),
        supabase.from("education_exercise_submissions").select("id", { count: "exact", head: true }).eq("user_id", uid),
        supabase.from("education_math_solves").select("id", { count: "exact", head: true }).eq("user_id", uid),
        supabase.from("educational_progress").select("lessons_completed, stars_earned").eq("user_id", uid),
      ]);

      const progressXP = (progressRows ?? []).reduce(
        (sum: number, r: any) => sum + (r.lessons_completed ?? 0) * 10 + (r.stars_earned ?? 0) * 5,
        0,
      );

      const currentXP =
        (dailyCount ?? 0) * 20 +
        (lessonCount ?? 0) * 15 +
        (exerciseCount ?? 0) * 10 +
        (mathCount ?? 0) * 5 +
        progressXP;

      const todayCompleted = (todayCompletions?.length ?? 0) > 0;
      const currentStreak = Math.max(points?.login_streak ?? 0, todayCompleted ? 1 : 0);
      return {
        currentXP,
        currentStreak,
        bestStreak: Math.max(points?.longest_streak ?? 0, currentStreak),
        todayCompleted };
    },
    staleTime: 60_000 });
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
      const { data: profiles } = await (supabase as any)
        .from("public_profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      return top.map((row) => { const profile = profiles?.find((p) => p.id === row.user_id);
        return {
          user_id: row.user_id,
          total_points: row.total_points ?? 0,
          full_name: profile?.full_name ?? null,
          avatar_url: profile?.avatar_url ?? null };
      });
    },
    staleTime: 60_000 });
};
