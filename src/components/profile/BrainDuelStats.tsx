import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useBrainDuelStats } from '@/hooks/useBrainDuelStats';
import { useBrainDuelCredits } from '@/hooks/useBrainDuelCredits';
import { Trophy, Target, TrendingUp, Coins, Brain, Calendar } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import BadgesDisplay from '@/components/gamification/BadgesDisplay';
import AchievementsShowcase from '@/components/brain-duel/AchievementsShowcase';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface BrainDuelStatsProps {
  userId: string;
}

export const BrainDuelStats = ({ userId }: BrainDuelStatsProps) => {
  const { data: stats, isLoading } = useBrainDuelStats(userId);
  const { credits } = useBrainDuelCredits();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
      setIsOwnProfile(user?.id === userId);
    };
    getCurrentUser();
  }, [userId]);

  if (isLoading) {
    return (
    <>
      <FloatingHowItWorks title={"Brain Duel Stats - How it works"} steps={[{ title: 'Open', desc: 'Access the Brain Duel Stats section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Brain Duel Stats.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading statistics...</div>
      </div>
    </>
  );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isOwnProfile ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              Total Games
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalGames}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.wins}W - {stats.losses}L
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.winRate.toFixed(1)}%</div>
            <Progress value={stats.winRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              Avg Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.averageScore.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">per game</p>
          </CardContent>
        </Card>

        {isOwnProfile && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Coins className="h-4 w-4 text-amber-500" />
                Credits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{credits}</div>
              <p className="text-xs text-muted-foreground mt-1">available</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Favorite Category */}
      {stats.favoriteCategory && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Favorite Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {stats.favoriteCategory}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Recent Matches */}
      {stats.recentMatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentMatches.map((match, index) => {
                const isWinner = match.winner_id === userId;
                const userScore = match.isPlayer1 ? match.player1_score : match.player2_score;
                const opponentScore = match.isPlayer1 ? match.player2_score : match.player1_score;

                return (
                  <div key={match.id}>
                    {index > 0 && <Separator className="mb-4" />}
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={isWinner ? 'default' : 'secondary'}>
                            {isWinner ? 'Victory' : 'Defeat'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {match.category}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(match.created_at), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {userScore} - {opponentScore}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Friend Challenge Achievements */}
      <AchievementsShowcase userId={userId} />

      {/* Badges & Achievements */}
      <BadgesDisplay userId={userId} />

      {/* Empty State */}
      {stats.totalGames === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No games played yet</h3>
            <p className="text-muted-foreground text-center">
              Start playing Brain Duel to see your statistics here!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
