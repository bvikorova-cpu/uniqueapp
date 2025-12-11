import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Crown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

interface LeaderboardEntry {
  user_id: string;
  wins: number;
  total_games: number;
  win_rate: number;
  profile: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export const BrainDuelLeaderboard = () => {
  const navigate = useNavigate();

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['brain-duel-leaderboard'],
    queryFn: async () => {
      // Get all finished matches
      const { data: matches, error } = await supabase
        .from('brain_duel_matches')
        .select('player1_id, player2_id, winner_id')
        .eq('status', 'finished');

      if (error) throw error;
      if (!matches) return [];

      // Calculate stats for each player
      const playerStats: Record<string, { wins: number; total: number }> = {};

      matches.forEach((match) => {
        // Track player 1
        if (!playerStats[match.player1_id]) {
          playerStats[match.player1_id] = { wins: 0, total: 0 };
        }
        playerStats[match.player1_id].total++;
        if (match.winner_id === match.player1_id) {
          playerStats[match.player1_id].wins++;
        }

        // Track player 2
        if (!playerStats[match.player2_id]) {
          playerStats[match.player2_id] = { wins: 0, total: 0 };
        }
        playerStats[match.player2_id].total++;
        if (match.winner_id === match.player2_id) {
          playerStats[match.player2_id].wins++;
        }
      });

      // Convert to array and calculate win rate
      const leaderboardData = Object.entries(playerStats)
        .map(([userId, stats]) => ({
          user_id: userId,
          wins: stats.wins,
          total_games: stats.total,
          win_rate: (stats.wins / stats.total) * 100,
        }))
        .filter((entry) => entry.total_games >= 3) // Only show players with at least 3 games
        .sort((a, b) => {
          // Sort by wins first, then by win rate
          if (b.wins !== a.wins) return b.wins - a.wins;
          return b.win_rate - a.win_rate;
        })
        .slice(0, 10);

      // Fetch profiles for top players
      const userIds = leaderboardData.map((entry) => entry.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      // Merge profiles with leaderboard data
      return leaderboardData.map((entry) => ({
        ...entry,
        profile: profiles?.find((p) => p.id === entry.user_id) || null,
      }));
    },
  });

  const getMedalIcon = (index: number) => {
    if (index === 0)
      return <Crown className="h-6 w-6 text-yellow-500" />;
    if (index === 1)
      return <Trophy className="h-5 w-5 text-gray-400" />;
    if (index === 2)
      return <Medal className="h-5 w-5 text-amber-600" />;
    return (
      <span className="text-lg font-bold text-muted-foreground">
        #{index + 1}
      </span>
    );
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
            Top Players
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            Loading leaderboard...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
            Top Players
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            No leaderboard data yet. Play games to see rankings!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
          Top Players
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.user_id}
              onClick={() => navigate(`/profile/${entry.user_id}`)}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 flex justify-center">{getMedalIcon(index)}</div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={entry.profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    {entry.profile?.full_name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    {entry.profile?.full_name || 'Anonymous User'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {entry.total_games} games • {entry.win_rate.toFixed(1)}% win rate
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{entry.wins}</p>
                <p className="text-xs text-muted-foreground">wins</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
