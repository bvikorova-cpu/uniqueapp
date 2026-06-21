import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VotingStreakData {
  currentStreak: number;
  longestStreak: number;
  lastVoteDate: string | null;
  totalVotesCast: number;
  creditsEarned: number;
}

export const useVotingStreak = () => {
  return useQuery<VotingStreakData>({
    queryKey: ["voting-streak"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          lastVoteDate: null,
          totalVotesCast: 0,
          creditsEarned: 0,
        };
      }

      const { data, error } = await supabase
        .from("voting_streaks")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error || !data) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          lastVoteDate: null,
          totalVotesCast: 0,
          creditsEarned: 0,
        };
      }

      return {
        currentStreak: data.current_streak,
        longestStreak: data.longest_streak,
        lastVoteDate: data.last_vote_date,
        totalVotesCast: data.total_votes_cast,
        creditsEarned: data.credits_earned,
      };
    },
  });
};
