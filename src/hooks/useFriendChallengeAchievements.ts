import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FRIEND_CHALLENGE_ACHIEVEMENTS } from '@/types/brain-duel-achievements';

export const useFriendChallengeAchievements = (userId?: string) => {
  const queryClient = useQueryClient();

  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ['friend-challenge-achievements', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('brain_duel_friend_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('achieved_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const checkAndAwardAchievements = useMutation({
    mutationFn: async (userId: string) => {
      // Get user's match history
      const { data: matches, error: matchError } = await supabase
        .from('brain_duel_matches')
        .select(`
          id,
          player1_id,
          player2_id,
          player1_score,
          player2_score,
          winner_id,
          created_at,
          brain_duel_friend_challenges!inner(
            id,
            stake_credits
          )
        `)
        .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
        .eq('status', 'finished')
        .order('created_at', { ascending: false });

      if (matchError) throw matchError;
      if (!matches || matches.length === 0) return [];

      const newAchievements: string[] = [];
      const { data: existingAchievements } = await supabase
        .from('brain_duel_friend_achievements')
        .select('achievement_type')
        .eq('user_id', userId);

      const hasAchievement = (type: string) =>
        existingAchievements?.some((a) => a.achievement_type === type);

      // Count wins
      const wins = matches.filter((m) => m.winner_id === userId).length;

      // First Victory
      if (wins >= 1 && !hasAchievement('first_victory')) {
        await awardAchievement(userId, 'first_victory');
        newAchievements.push('first_victory');
      }

      // Champion (50 wins)
      if (wins >= 50 && !hasAchievement('champion')) {
        await awardAchievement(userId, 'champion');
        newAchievements.push('champion');
      }

      // Check win streak
      let currentStreak = 0;
      let maxStreak = 0;
      for (const match of matches) {
        if (match.winner_id === userId) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      }

      // Undefeated Streak (5 wins)
      if (maxStreak >= 5 && !hasAchievement('undefeated_streak_5')) {
        await awardAchievement(userId, 'undefeated_streak_5');
        newAchievements.push('undefeated_streak_5');
      }

      // Unbeatable (10 wins)
      if (maxStreak >= 10 && !hasAchievement('unbeatable')) {
        await awardAchievement(userId, 'unbeatable');
        newAchievements.push('unbeatable');
      }

      // Calculate total credits won
      const totalCreditsWon = matches
        .filter((m) => m.winner_id === userId)
        .reduce((sum, m) => {
          const challenge = m.brain_duel_friend_challenges as { stake_credits?: number } | null;
          const stake = challenge?.stake_credits || 0;
          return sum + stake;
        }, 0);

      // Credit Collector (1000+ credits)
      if (totalCreditsWon >= 1000 && !hasAchievement('credit_collector')) {
        await awardAchievement(userId, 'credit_collector');
        newAchievements.push('credit_collector');
      }

      // Check for rivalry (10+ games against same opponent)
      const opponentCounts = new Map<string, number>();
      matches.forEach((m) => {
        const opponentId = m.player1_id === userId ? m.player2_id : m.player1_id;
        if (opponentId) {
          opponentCounts.set(opponentId, (opponentCounts.get(opponentId) || 0) + 1);
        }
      });

      const hasRivalry = Array.from(opponentCounts.values()).some((count) => count >= 10);
      if (hasRivalry && !hasAchievement('rivalry_master')) {
        await awardAchievement(userId, 'rivalry_master');
        newAchievements.push('rivalry_master');
      }

      return newAchievements;
    },
    onSuccess: (newAchievements) => {
      queryClient.invalidateQueries({ queryKey: ['friend-challenge-achievements'] });
      
      // Show toast for each new achievement
      newAchievements.forEach((achievementId) => {
        const achievement = FRIEND_CHALLENGE_ACHIEVEMENTS[achievementId];
        if (achievement) {
          toast.success(`🏆 Achievement Unlocked!`, {
            description: `${achievement.name}: ${achievement.description}`,
          });
        }
      });
    },
  });

  const awardAchievement = async (userId: string, achievementType: string) => {
    const { error } = await supabase
      .from('brain_duel_friend_achievements')
      .insert({
        user_id: userId,
        achievement_type: achievementType,
      });

    if (error && !error.message.includes('duplicate key')) {
      console.error('Error awarding achievement:', error);
    }
  };

  return {
    achievements,
    isLoading,
    checkAndAwardAchievements: checkAndAwardAchievements.mutate,
    isChecking: checkAndAwardAchievements.isPending,
  };
};
