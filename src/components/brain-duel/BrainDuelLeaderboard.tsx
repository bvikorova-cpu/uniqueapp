import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Crown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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
      const { data: matches, error } = await supabase
        .from('brain_duel_matches')
        .select('player1_id, player2_id, winner_id')
        .eq('status', 'finished');

      if (error) throw error;
      if (!matches) return [];

      const playerStats: Record<string, { wins: number; total: number }> = {};

      matches.forEach((match) => {
        if (!playerStats[match.player1_id]) {
          playerStats[match.player1_id] = { wins: 0, total: 0 };
        }
        playerStats[match.player1_id].total++;
        if (match.winner_id === match.player1_id) {
          playerStats[match.player1_id].wins++;
        }

        if (!playerStats[match.player2_id]) {
          playerStats[match.player2_id] = { wins: 0, total: 0 };
        }
        playerStats[match.player2_id].total++;
        if (match.winner_id === match.player2_id) {
          playerStats[match.player2_id].wins++;
        }
      });

      const leaderboardData = Object.entries(playerStats)
        .map(([userId, stats]) => ({
          user_id: userId,
          wins: stats.wins,
          total_games: stats.total,
          win_rate: (stats.wins / stats.total) * 100,
        }))
        .filter((entry) => entry.total_games >= 3)
        .sort((a, b) => {
          if (b.wins !== a.wins) return b.wins - a.wins;
          return b.win_rate - a.win_rate;
        })
        .slice(0, 10);

      const userIds = leaderboardData.map((entry) => entry.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

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
    <>
      <FloatingHowItWorks title={"Brain Duel Leaderboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Brain Duel Leaderboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Brain Duel Leaderboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <span className="text-lg font-bold text-muted-foreground">
        #{index + 1}
      </span>
    </>
  );
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden backdrop-blur-xl bg-card/80 border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
            Top Players
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <Card className="overflow-hidden backdrop-blur-xl bg-card/80 border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
            Top Players
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-6">
            <Trophy className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" />
            No leaderboard data yet. Play games to see rankings!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden backdrop-blur-xl bg-card/80 border-primary/10 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 via-transparent to-transparent" />
      <CardHeader className="pb-3 relative">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
          Top Players
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-2">
          {leaderboard.map((entry, index) => (
            <motion.div
              key={entry.user_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              onClick={() => navigate(`/profile/${entry.user_id}`)}
              className={`flex items-center justify-between p-3 rounded-lg border backdrop-blur-sm cursor-pointer transition-all hover:scale-[1.01] ${
                index === 0 ? 'bg-yellow-500/10 border-yellow-500/20 shadow-sm' :
                index < 3 ? 'bg-primary/5 border-primary/10' :
                'bg-muted/20 border-primary/5 hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 flex justify-center">{getMedalIcon(index)}</div>
                <Avatar className={`h-10 w-10 ${index === 0 ? 'ring-2 ring-yellow-500/50' : ''}`}>
                  <AvatarImage src={entry.profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10">
                    {entry.profile?.full_name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    {entry.profile?.full_name || 'Anonymous User'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.total_games} games • {entry.win_rate.toFixed(1)}% win rate
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-primary">{entry.wins}</p>
                <p className="text-[10px] text-muted-foreground">wins</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};