import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BrainDuelStats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPoints: number;
  averageScore: number;
  favoriteCategory: string | null;
  recentMatches: Array<{
    id: string;
    category: string;
    player1_score: number;
    player2_score: number;
    winner_id: string | null;
    created_at: string;
    isPlayer1: boolean;
    opponent_name?: string;
  }>;
}

export const useBrainDuelStats = (userId?: string) => {
  return useQuery({
    queryKey: ['brain-duel-stats', userId],
    queryFn: async (): Promise<BrainDuelStats> => {
      if (!userId) throw new Error('User ID required');

      // Fetch all matches for this user
      const { data: matches, error } = await supabase
        .from('brain_duel_matches')
        .select('*')
        .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
        .eq('status', 'finished')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!matches || matches.length === 0) {
        return {
          totalGames: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
          totalPoints: 0,
          averageScore: 0,
          favoriteCategory: null,
          recentMatches: [],
        };
      }

      // Calculate statistics
      const wins = matches.filter((m) => m.winner_id === userId).length;
      const losses = matches.length - wins;
      const winRate = (wins / matches.length) * 100;

      // Calculate total points and average score
      const scores = matches.map((m) => {
        const score = m.player1_id === userId ? m.player1_score : m.player2_score;
        return score || 0;
      });
      const totalPoints = scores.reduce((sum, score) => sum + score, 0);
      const averageScore = matches.length > 0 ? totalPoints / matches.length : 0;

      // Find favorite category
      const categoryCounts: Record<string, number> = {};
      matches.forEach((m) => {
        categoryCounts[m.category] = (categoryCounts[m.category] || 0) + 1;
      });
      const favoriteCategory = Object.keys(categoryCounts).length > 0
        ? Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0][0]
        : null;

      // Get recent matches with opponent names
      const recentMatches = matches.slice(0, 10).map((match) => {
        const isPlayer1 = match.player1_id === userId;
        return {
          id: match.id,
          category: match.category,
          player1_score: match.player1_score,
          player2_score: match.player2_score,
          winner_id: match.winner_id,
          created_at: match.created_at,
          isPlayer1,
        };
      });

      return {
        totalGames: matches.length,
        wins,
        losses,
        winRate,
        totalPoints,
        averageScore,
        favoriteCategory,
        recentMatches,
      };
    },
    enabled: !!userId,
  });
};
