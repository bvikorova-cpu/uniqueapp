import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { HeroCreationForm } from "@/components/superhero/HeroCreationForm";
import { AgeVerification } from "@/components/superhero/AgeVerification";
import { 
  Zap, Shield, Users, Trophy, Sparkles, Swords, Crown, Target, 
  TrendingUp, Star, Plus, ArrowRight, Flame, Gem, Rocket, Loader2 
} from "lucide-react";

interface Hero {
  id: string;
  name: string;
  power_type: string;
  rarity: string;
  power_level: number;
  strength: number;
  speed: number;
  intelligence: number;
  defense: number;
  total_wins: number;
  total_losses: number;
  level: number;
}

interface Tournament {
  id: string;
  name: string;
  entry_fee: number;
  prize_pool: number;
  max_teams: number;
  current_teams: number;
  status: string;
  ends_at: string;
}

const SuperHeroUniverse = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [showCreationForm, setShowCreationForm] = useState(false);
  const [myHeroes, setMyHeroes] = useState<Hero[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [topHeroes, setTopHeroes] = useState<Hero[]>([]);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAgeVerification();
    loadData();
  }, []);

  const checkAgeVerification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('superhero_age_verification')
        .select('is_verified')
        .eq('user_id', user.id)
        .maybeSingle();

      setIsAgeVerified(data?.is_verified || false);
    } catch (error) {
      console.error('Error checking age verification:', error);
    }
  };

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Load user's heroes
        const { data: heroesData } = await supabase
          .from('superhero_heroes')
          .select('*')
          .eq('user_id', user.id)
          .order('power_level', { ascending: false });
        setMyHeroes(heroesData || []);

        // Load credits
        const { data: creditsData } = await supabase
          .from('superhero_credits')
          .select('credits')
          .eq('user_id', user.id)
          .maybeSingle();
        setCredits(creditsData?.credits || 0);
      }

      // Load active tournaments
      const { data: tournamentsData } = await supabase
        .from('superhero_tournaments')
        .select('*')
        .in('status', ['registration', 'in_progress'])
        .order('starts_at', { ascending: true })
        .limit(10);
      setTournaments(tournamentsData || []);

      // Load top heroes
      const { data: topHeroesData } = await supabase
        .from('superhero_heroes')
        .select('*')
        .order('power_level', { ascending: false })
        .limit(10);
      setTopHeroes(topHeroesData || []);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTournament = async (tournamentId: string, heroId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please sign in to join tournaments",
        });
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke('join-superhero-tournament', {
        body: { tournamentId, heroId },
      });

      if (error) throw error;

      if (data?.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error,
        });
        return;
      }

      toast({
        title: "Tournament Joined! 🎉",
        description: "Your hero is registered for the tournament",
      });

      loadData(); // Reload to update credits and tournament info
    } catch (error: any) {
      console.error("Error joining tournament:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to join tournament",
      });
    }
  };

  const getRarityColor = (rarity: string) => {
    switch(rarity.toLowerCase()) {
      case 'mythic': return 'text-purple-500';
      case 'legendary': return 'text-orange-500';
      case 'epic': return 'text-pink-500';
      case 'rare': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getRarityBadgeColor = (rarity: string) => {
    switch(rarity.toLowerCase()) {
      case 'mythic': return 'bg-purple-500/20 text-purple-300 border-purple-500';
      case 'legendary': return 'bg-orange-500/20 text-orange-300 border-orange-500';
      case 'epic': return 'bg-pink-500/20 text-pink-300 border-pink-500';
      case 'rare': return 'bg-blue-500/20 text-blue-300 border-blue-500';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500';
    }
  };

  if (!isAgeVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 py-12">
        <div className="container mx-auto px-4">
          <AgeVerification onVerified={() => setIsAgeVerified(true)} />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
                SuperHero Universe
              </h1>
              <p className="text-muted-foreground text-lg">
                Create heroes, battle in tournaments, win real prizes
              </p>
            </div>
            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardContent className="p-6 flex items-center gap-4">
                <Gem className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Your Credits</p>
                  <p className="text-2xl font-bold">{credits.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="gap-2">
              <Shield className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="my-heroes" className="gap-2">
              <Sparkles className="h-4 w-4" />
              My Heroes
            </TabsTrigger>
            <TabsTrigger value="tournaments" className="gap-2">
              <Trophy className="h-4 w-4" />
              Tournaments
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2">
              <Crown className="h-4 w-4" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Your Heroes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{myHeroes.length}/3</p>
                  <p className="text-sm text-muted-foreground">Maximum 3 heroes</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/10 to-pink-500/10 border-orange-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Total Wins
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">
                    {myHeroes.reduce((sum, h) => sum + h.total_wins, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Across all heroes</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Win Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">
                    {myHeroes.length > 0 
                      ? Math.round((myHeroes.reduce((sum, h) => sum + h.total_wins, 0) / 
                          Math.max(1, myHeroes.reduce((sum, h) => sum + h.total_wins + h.total_losses, 0))) * 100)
                      : 0}%
                  </p>
                  <p className="text-sm text-muted-foreground">Overall performance</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Highest Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">
                    {myHeroes.length > 0 ? Math.max(...myHeroes.map(h => h.level)) : 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Best hero level</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-6 w-6" />
                  Getting Started
                </CardTitle>
                <CardDescription>
                  Create your first hero and start competing!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Plus className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">1. Create Hero</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Choose a power type and get randomly generated stats and rarity
                    </p>
                  </div>

                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Swords className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">2. Join Tournaments</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enter tournaments with entry fees and compete for prizes
                    </p>
                  </div>

                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">3. Win Prizes</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Battle strategically and win real money prizes legally
                    </p>
                  </div>
                </div>

                {myHeroes.length < 3 && (
                  <Button 
                    onClick={() => setShowCreationForm(true)} 
                    className="w-full" 
                    size="lg"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Create New Hero
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Heroes Tab */}
          <TabsContent value="my-heroes" className="space-y-6">
            {showCreationForm ? (
              <div>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowCreationForm(false)}
                  className="mb-4"
                >
                  ← Back to Heroes
                </Button>
                <HeroCreationForm />
              </div>
            ) : (
              <>
                {myHeroes.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-semibold mb-2">No Heroes Yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Create your first superhero to start your journey!
                      </p>
                      <Button onClick={() => setShowCreationForm(true)} size="lg">
                        <Plus className="mr-2 h-5 w-5" />
                        Create Your First Hero
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {myHeroes.map((hero) => (
                      <Card key={hero.id} className="overflow-hidden">
                        <div className={`h-2 bg-gradient-to-r ${
                          hero.rarity === 'mythic' ? 'from-purple-500 to-pink-500' :
                          hero.rarity === 'legendary' ? 'from-orange-500 to-yellow-500' :
                          hero.rarity === 'epic' ? 'from-pink-500 to-purple-500' :
                          hero.rarity === 'rare' ? 'from-blue-500 to-cyan-500' :
                          'from-gray-500 to-gray-600'
                        }`} />
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="flex items-center gap-2">
                                <span className={getRarityColor(hero.rarity)}>{hero.name}</span>
                              </CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className={getRarityBadgeColor(hero.rarity)}>
                                  {hero.rarity.toUpperCase()}
                                </Badge>
                                <Badge variant="outline">Level {hero.level}</Badge>
                              </CardDescription>
                            </div>
                            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm">Power Level</span>
                              <span className="text-sm font-bold">{hero.power_level}</span>
                            </div>
                            <Progress value={(hero.power_level / 1000) * 100} className="h-2" />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-red-500" />
                                <span className="text-sm">Strength</span>
                              </div>
                              <Progress value={(hero.strength / 150) * 100} className="h-1.5" />
                              <span className="text-xs text-muted-foreground">{hero.strength}</span>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm">Speed</span>
                              </div>
                              <Progress value={(hero.speed / 150) * 100} className="h-1.5" />
                              <span className="text-xs text-muted-foreground">{hero.speed}</span>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-purple-500" />
                                <span className="text-sm">Intelligence</span>
                              </div>
                              <Progress value={(hero.intelligence / 150) * 100} className="h-1.5" />
                              <span className="text-xs text-muted-foreground">{hero.intelligence}</span>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-blue-500" />
                                <span className="text-sm">Defense</span>
                              </div>
                              <Progress value={(hero.defense / 150) * 100} className="h-1.5" />
                              <span className="text-xs text-muted-foreground">{hero.defense}</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">W/L Record</span>
                              <span className="font-semibold">{hero.total_wins}W - {hero.total_losses}L</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {myHeroes.length < 3 && (
                      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setShowCreationForm(true)}>
                        <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px]">
                          <Plus className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="font-semibold mb-1">Create New Hero</h3>
                          <p className="text-sm text-muted-foreground text-center">
                            You can have up to 3 heroes
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Tournaments Tab */}
          <TabsContent value="tournaments" className="space-y-6">
            {tournaments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Active Tournaments</h3>
                  <p className="text-muted-foreground">
                    Check back soon for new tournaments!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {tournaments.map((tournament) => (
                  <Card key={tournament.id} className="overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-orange-500 to-pink-500" />
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-orange-500" />
                            {tournament.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            <Badge variant={tournament.status === 'registration' ? 'default' : 'secondary'}>
                              {tournament.status === 'registration' ? 'Open for Registration' : 'In Progress'}
                            </Badge>
                          </CardDescription>
                        </div>
                        <Flame className="h-6 w-6 text-orange-500" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Entry Fee</p>
                          <p className="text-2xl font-bold flex items-center gap-1">
                            <Gem className="h-5 w-5 text-primary" />
                            {tournament.entry_fee.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Prize Pool</p>
                          <p className="text-2xl font-bold text-orange-500">
                            €{tournament.prize_pool.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Participants</span>
                          <span className="text-sm font-semibold">
                            {tournament.current_teams}/{tournament.max_teams}
                          </span>
                        </div>
                        <Progress 
                          value={(tournament.current_teams / tournament.max_teams) * 100} 
                          className="h-2"
                        />
                      </div>

                      {tournament.status === 'registration' && myHeroes.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold">Select Your Hero:</p>
                          <div className="grid gap-2">
                            {myHeroes.map((hero) => (
                              <Button
                                key={hero.id}
                                variant="outline"
                                onClick={() => handleJoinTournament(tournament.id, hero.id)}
                                className="justify-between"
                              >
                                <span>{hero.name} (Lvl {hero.level})</span>
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {tournament.status === 'registration' && myHeroes.length === 0 && (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            setActiveTab('my-heroes');
                            setShowCreationForm(true);
                          }}
                        >
                          Create Hero to Join
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-6 w-6 text-yellow-500" />
                  Top Heroes
                </CardTitle>
                <CardDescription>
                  The most powerful heroes in the universe
                </CardDescription>
              </CardHeader>
              <CardContent>
                {topHeroes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No heroes yet. Be the first!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topHeroes.map((hero, index) => (
                      <div 
                        key={hero.id} 
                        className={`flex items-center gap-4 p-4 rounded-lg border ${
                          index === 0 ? 'bg-yellow-500/10 border-yellow-500/30' :
                          index === 1 ? 'bg-gray-400/10 border-gray-400/30' :
                          index === 2 ? 'bg-orange-600/10 border-orange-600/30' :
                          'bg-muted/50'
                        }`}
                      >
                        <div className={`text-2xl font-bold w-8 text-center ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-gray-400' :
                          index === 2 ? 'text-orange-600' :
                          'text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-semibold ${getRarityColor(hero.rarity)}`}>
                              {hero.name}
                            </span>
                            <Badge variant="outline" className={getRarityBadgeColor(hero.rarity)}>
                              {hero.rarity}
                            </Badge>
                            <Badge variant="outline">Lvl {hero.level}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Power: {hero.power_level}</span>
                            <span>W/L: {hero.total_wins}/{hero.total_losses}</span>
                            <span className="capitalize">{hero.power_type}</span>
                          </div>
                        </div>
                        {index < 3 && (
                          <Crown className={`h-6 w-6 ${
                            index === 0 ? 'text-yellow-500' :
                            index === 1 ? 'text-gray-400' :
                            'text-orange-600'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SuperHeroUniverse;
