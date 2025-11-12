import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FriendStats {
  friend_id: string;
  friend_name: string;
  friend_avatar: string | null;
  wins: number;
  losses: number;
  total_credits_won: number;
  total_credits_lost: number;
  net_credits: number;
  total_games: number;
}

export const useFriendChallengeStats = (userId?: string) => {
  return useQuery({
    queryKey: ['friend-challenge-stats', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');

      // Get all matches from friend challenges where user participated
      const { data: matches, error } = await supabase
        .from('brain_duel_matches')
        .select(`
          id,
          player1_id,
          player2_id,
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

      if (error) throw error;
      if (!matches || matches.length === 0) return [];

      // Group by opponent
      const statsMap = new Map<string, FriendStats>();

      for (const match of matches) {
        const isPlayer1 = match.player1_id === userId;
        const opponentId = isPlayer1 ? match.player2_id : match.player1_id;
        const won = match.winner_id === userId;
        const stake = (match.brain_duel_friend_challenges as any)?.stake_credits || 0;

        if (!statsMap.has(opponentId)) {
          statsMap.set(opponentId, {
            friend_id: opponentId,
            friend_name: '',
            friend_avatar: null,
            wins: 0,
            losses: 0,
            total_credits_won: 0,
            total_credits_lost: 0,
            net_credits: 0,
            total_games: 0,
          });
        }

        const stats = statsMap.get(opponentId)!;
        stats.total_games++;

        if (won) {
          stats.wins++;
          stats.total_credits_won += stake;
        } else {
          stats.losses++;
          stats.total_credits_lost += stake;
        }

        stats.net_credits = stats.total_credits_won - stats.total_credits_lost;
      }

      // Get friend profiles
      const friendIds = Array.from(statsMap.keys());
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', friendIds);

      if (profiles) {
        profiles.forEach(profile => {
          const stats = statsMap.get(profile.id);
          if (stats) {
            stats.friend_name = profile.full_name || 'Unknown';
            stats.friend_avatar = profile.avatar_url;
          }
        });
      }

      // Convert to array and sort by net credits (descending)
      return Array.from(statsMap.values()).sort((a, b) => b.net_credits - a.net_credits);
    },
    enabled: !!userId,
  });
};
