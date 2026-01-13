import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Crown, Flame, TrendingUp, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBrainDuelCredits } from '@/hooks/useBrainDuelCredits';

interface League {
  id: string;
  name: string;
  entry: number;
  description: string;
  color: string;
  icon: string;
  minPoints: number;
  featured?: boolean;
}

const leagues: League[] = [
  { id: 'bronze', name: 'Bronze League', entry: 10, description: 'Beginners', color: 'bg-amber-700', icon: '🥉', minPoints: 0 },
  { id: 'silver', name: 'Silver League', entry: 20, description: 'Advanced', color: 'bg-slate-400', icon: '🥈', minPoints: 500 },
  { id: 'gold', name: 'Gold League', entry: 50, description: 'Experts', color: 'bg-yellow-500', icon: '🥇', minPoints: 1500 },
  { id: 'diamond', name: 'Diamond League', entry: 100, description: 'Elite', color: 'bg-cyan-400', icon: '💎', minPoints: 5000, featured: true },
];

export const LeagueSystem = () => {
  const { toast } = useToast();
  const { credits } = useBrainDuelCredits();

  // Fetch user's league data
  const { data: userLeague } = useQuery({
    queryKey: ['brain-duel-user-league'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from('brain_duel_leagues')
        .select('*')
        .eq('user_id', user.id)
        .eq('season', 'Q1-2026')
        .single();

      return data;
    },
  });

  // Fetch league leaderboard
  const { data: leaderboard } = useQuery({
    queryKey: ['brain-duel-league-leaderboard'],
    queryFn: async () => {
      const { data: leagueData } = await supabase
        .from('brain_duel_leagues')
        .select('*')
        .eq('season', 'Q1-2026')
        .order('league_points', { ascending: false })
        .limit(10);

      if (!leagueData) return [];

      // Fetch profiles
      const userIds = leagueData.map(l => l.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      return leagueData.map(entry => ({
        ...entry,
        profile: profiles?.find(p => p.id === entry.user_id),
      }));
    },
  });

  const handleJoinLeague = (league: League) => {
    if (credits < league.entry) {
      toast({
        title: 'Insufficient Credits',
        description: `You need ${league.entry} credits to join ${league.name}`,
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'Joining League...',
      description: `Searching for opponents in ${league.name}`,
    });
  };

  const getCurrentLeague = () => {
    if (!userLeague) return leagues[0];
    const points = userLeague.league_points || 0;
    return leagues.slice().reverse().find(l => points >= l.minPoints) || leagues[0];
  };

  const getNextLeague = () => {
    const current = getCurrentLeague();
    const currentIndex = leagues.findIndex(l => l.id === current.id);
    return leagues[currentIndex + 1];
  };

  const getProgressToNextLeague = () => {
    if (!userLeague) return 0;
    const current = getCurrentLeague();
    const next = getNextLeague();
    if (!next) return 100;
    
    const points = userLeague.league_points || 0;
    const progress = ((points - current.minPoints) / (next.minPoints - current.minPoints)) * 100;
    return Math.min(progress, 100);
  };

  return (
    <div className="space-y-6">
      {/* User's Current League Status */}
      {userLeague && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <span className="text-3xl">{getCurrentLeague().icon}</span>
              Your League Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-background rounded-lg">
                <Trophy className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                <p className="text-2xl font-bold">{userLeague.total_wins}</p>
                <p className="text-xs text-muted-foreground">Total Wins</p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <Flame className="h-5 w-5 mx-auto mb-1 text-orange-500" />
                <p className="text-2xl font-bold">{userLeague.win_streak}</p>
                <p className="text-xs text-muted-foreground">Win Streak</p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-500" />
                <p className="text-2xl font-bold">{userLeague.league_points}</p>
                <p className="text-xs text-muted-foreground">League Points</p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <Medal className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                <p className="text-2xl font-bold">{userLeague.best_win_streak}</p>
                <p className="text-xs text-muted-foreground">Best Streak</p>
              </div>
            </div>
            
            {getNextLeague() && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{getCurrentLeague().icon} {getCurrentLeague().name}</span>
                  <span>{getNextLeague()?.icon} {getNextLeague()?.name}</span>
                </div>
                <Progress value={getProgressToNextLeague()} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  {getNextLeague()!.minPoints - (userLeague.league_points || 0)} points to next league
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* League Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Tiered Tournaments
          </CardTitle>
          <CardDescription>
            Compete in your skill level and climb the ranks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {leagues.map((league) => {
              const canAfford = credits >= league.entry;
              return (
                <Card 
                  key={league.id}
                  className={`relative ${league.featured ? 'border-primary/50 ring-2 ring-primary/20' : ''}`}
                >
                  {league.featured && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-purple-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                      ELITE
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${league.color} rounded-full flex items-center justify-center text-2xl`}>
                        {league.icon}
                      </div>
                      <div>
                        <div>{league.name}</div>
                        <div className="text-sm font-normal text-muted-foreground">
                          {league.description}
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Entry cost:</span>
                      <Badge variant={canAfford ? "default" : "secondary"} className="text-lg font-bold">
                        {league.entry} credits
                      </Badge>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => handleJoinLeague(league)}
                      disabled={!canAfford}
                    >
                      Join Tournament
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* League Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            League Leaderboard - Q1 2026
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard && leaderboard.length > 0 ? (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <div 
                  key={entry.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    index < 3 ? 'bg-primary/5' : 'bg-muted/50'
                  }`}
                >
                  <div className="w-8 text-center font-bold">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={entry.profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {entry.profile?.full_name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{entry.profile?.full_name || 'Anonymous'}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.total_wins} wins • {entry.league} league
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{entry.league_points}</p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No league data yet. Start playing to climb the ranks!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
