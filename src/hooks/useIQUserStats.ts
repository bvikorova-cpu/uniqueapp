import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface IQUserStats {
  user_id: string;
  best_iq: number;
  latest_iq: number;
  total_tests: number;
  total_correct: number;
  total_questions: number;
  current_streak: number;
  longest_streak: number;
  last_test_date: string | null;
  tier: string;
  sub_scores: Record<string, number>;
  country_code: string | null;
}

export function useIQUserStats() {
  return useQuery({
    queryKey: ["iq-user-stats"],
    queryFn: async (): Promise<IQUserStats | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("iq_user_stats")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return (data as unknown as IQUserStats) ?? null;
    },
  });
}

export function useIQGlobalCounts() {
  return useQuery({
    queryKey: ["iq-global-counts"],
    queryFn: async () => {
      const [{ count: testCount }, { count: userCount }] = await Promise.all([
        supabase.from("iq_test_results").select("*", { count: "exact", head: true }),
        supabase.from("iq_user_stats").select("*", { count: "exact", head: true }),
      ]);
      return { totalTests: testCount ?? 0, totalUsers: userCount ?? 0 };
    },
    staleTime: 60_000,
  });
}

export function useIQProgress() {
  return useQuery({
    queryKey: ["iq-progress"],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_iq_progress");
      return (data ?? []) as Array<{
        completed_at: string;
        iq_score: number;
        percentile: number;
        category: string;
      }>;
    },
  });
}
