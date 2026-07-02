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
import { motion } from 'framer-motion';
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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
      toast({ title: 'Insufficient Credits', description: `You need ${league.entry} credits to join ${league.name}`, variant: 'destructive' });
      return;
    }
    toast({ title: 'Joining League...', description: `Searching for opponents in ${league.name}` });
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
    return Math.min(((points - current.minPoints) / (next.minPoints - current.minPoints)) * 100, 100);
  };

  return (
    <>
      <FloatingHowItWorks title={"League System - How it works"} steps={[{ title: 'Open', desc: 'Access the League System section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in League System.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      {/* User's Current League Status */}
      {userLeague && (
        <Card className="border-primary/30 backdrop-blur-xl bg-card/80 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
          <CardHeader className="relative pb-2">
            <CardTitle className="flex items-center gap-2">
              <span className="text-3xl">{getCurrentLeague().icon}</span>
              Your League Status
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Trophy, value: userLeague.total_wins, label: "Total Wins", color: "text-yellow-500" },
                { icon: Flame, value: userLeague.win_streak, label: "Win Streak", color: "text-orange-500" },
                { icon: TrendingUp, value: userLeague.league_points, label: "League Points", color: "text-green-500" },
                { icon: Medal, value: userLeague.best_win_streak, label: "Best Streak", color: "text-purple-500" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="text-center p-3 bg-background/50 backdrop-blur-sm rounded-lg border border-primary/5"
                >
                  <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
                  <p className="text-2xl font-black">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
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
      <Card className="backdrop-blur-xl bg-card/80 border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Tiered Tournaments
          </CardTitle>
          <CardDescription>Compete in your skill level and climb the ranks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {leagues.map((league, i) => {
              const canAfford = credits >= league.entry;
              return (
                <motion.div
                  key={league.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className={`relative backdrop-blur-xl bg-card/80 transition-all hover:shadow-lg ${league.featured ? 'border-primary/50 ring-2 ring-primary/20' : 'border-primary/10'}`}>
                    {league.featured && (
                      <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-purple-600 text-white shadow-md">
                        ELITE
                      </Badge>
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${league.color} rounded-full flex items-center justify-center text-2xl shadow-md`}>
                          {league.icon}
                        </div>
                        <div>
                          <div>{league.name}</div>
                          <div className="text-sm font-normal text-muted-foreground">{league.description}</div>
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
                      <Button className="w-full" onClick={() => handleJoinLeague(league)} disabled={!canAfford}>
                        Join Tournament
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* League Leaderboard */}
      <Card className="backdrop-blur-xl bg-card/80 border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            League Leaderboard - Q1 2026
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard && leaderboard.length > 0 ? (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-lg backdrop-blur-sm ${
                    index < 3 ? 'bg-primary/5 border border-primary/10' : 'bg-muted/30 border border-primary/5'
                  }`}
                >
                  <div className="w-8 text-center font-bold">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  <Avatar className={`h-8 w-8 ${index === 0 ? 'ring-2 ring-yellow-500/50' : ''}`}>
                    <AvatarImage src={entry.profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs bg-primary/10">
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
                    <p className="font-black text-primary">{entry.league_points}</p>
                    <p className="text-[10px] text-muted-foreground">points</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-muted-foreground">No league data yet. Start playing to climb the ranks!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
};