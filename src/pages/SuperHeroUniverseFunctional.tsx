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

const SuperHeroUniverseFunctional = () => {
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

      if (!isAgeVerified) {
        toast({
          variant: "destructive",
          title: "Age Verification Required",
          description: "You must verify you are 18+ to join prize tournaments",
        });
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
        title: "Tournament Joined! 🏆",
        description: data.message,
      });

      loadData();
    } catch (error: any) {
      console.error('Error joining tournament:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to join tournament",
      });
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      common: "from-gray-400 to-gray-600",
      rare: "from-blue-400 to-blue-600",
      epic: "from-purple-400 to-purple-600",
      legendary: "from-yellow-400 to-yellow-600",
      mythic: "from-red-400 to-red-600"
    };
    return colors[rarity] || colors.common;
  };

  if (!isAgeVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-zinc-950 py-12">
        <div className="container mx-auto px-4">
          <AgeVerification onVerified={() => {
            setIsAgeVerified(true);
            loadData();
          }} />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-black via-slate-950 to-zinc-950">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-60"></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header with Credits */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent">
              SuperHero Universe
            </h1>
            <p className="text-gray-400 mt-2">Battle, Compete, Dominate</p>
          </div>
          <div className="flex items-center gap-4">
            <Card className="bg-black/40 border-yellow-500/30">
              <CardContent className="p-4 flex items-center gap-2">
                <Gem className="h-5 w-5 text-yellow-500" />
                <div>
                  <div className="text-xs text-gray-400">Credits</div>
                  <div className="text-xl font-bold">{credits.toLocaleString()}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-black/40 border border-gray-800">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="my-heroes">My Heroes ({myHeroes.length}/3)</TabsTrigger>
            <TabsTrigger value="tournaments">Tournaments ({tournaments.length})</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-black/40 border-red-500/30">
                <CardContent className="p-6">
                  <Users className="h-8 w-8 text-red-500 mb-2" />
                  <div className="text-2xl font-bold">{topHeroes.length}</div>
                  <div className="text-sm text-gray-400">Active Heroes</div>
                </CardContent>
              </Card>
              
              <Card className="bg-black/40 border-blue-500/30">
                <CardContent className="p-6">
                  <Trophy className="h-8 w-8 text-blue-500 mb-2" />
                  <div className="text-2xl font-bold">{tournaments.length}</div>
                  <div className="text-sm text-gray-400">Active Tournaments</div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-yellow-500/30">
                <CardContent className="p-6">
                  <Crown className="h-8 w-8 text-yellow-500 mb-2" />
                  <div className="text-2xl font-bold">{myHeroes.reduce((sum, h) => sum + h.total_wins, 0)}</div>
                  <div className="text-sm text-gray-400">Total Wins</div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-purple-500/30">
                <CardContent className="p-6">
                  <Zap className="h-8 w-8 text-purple-500 mb-2" />
                  <div className="text-2xl font-bold">{Math.max(...myHeroes.map(h => h.power_level), 0)}</div>
                  <div className="text-sm text-gray-400">Best Power Level</div>
                </CardContent>
              </Card>
            </div>

            {myHeroes.length === 0 && (
              <Card className="bg-gradient-to-br from-red-950/30 to-yellow-950/30 border-red-500/30">
                <CardContent className="p-8 text-center">
                  <Sparkles className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
                  <h3 className="text-2xl font-bold mb-2">Create Your First Hero!</h3>
                  <p className="text-gray-400 mb-6">Begin your journey to become a legendary champion</p>
                  <Button onClick={() => setShowCreationForm(true)} size="lg" className="bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700">
                    <Plus className="mr-2 h-5 w-5" />
                    Create Hero
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="my-heroes" className="space-y-4">
            {showCreationForm ? (
              <div>
                <Button onClick={() => setShowCreationForm(false)} variant="ghost" className="mb-4">
                  ← Back to Heroes
                </Button>
                <HeroCreationForm />
              </div>
            ) : (
              <>
                {myHeroes.length < 3 && (
                  <Button onClick={() => setShowCreationForm(true)} className="w-full bg-gradient-to-r from-red-600 to-yellow-600">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Hero ({myHeroes.length}/3)
                  </Button>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myHeroes.map((hero) => (
                    <Card key={hero.id} className={`bg-gradient-to-br ${getRarityColor(hero.rarity)} bg-opacity-20 border-2`}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{hero.name}</CardTitle>
                            <CardDescription className="text-white/80">
                              {hero.power_type.toUpperCase()} • Level {hero.level}
                            </CardDescription>
                          </div>
                          <Badge className={`bg-gradient-to-r ${getRarityColor(hero.rarity)}`}>
                            {hero.rarity.toUpperCase()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Power Level:</span>
                          <span className="font-bold">{hero.power_level}</span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Strength</span>
                              <span>{hero.strength}</span>
                            </div>
                            <Progress value={hero.strength} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Speed</span>
                              <span>{hero.speed}</span>
                            </div>
                            <Progress value={hero.speed} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Intelligence</span>
                              <span>{hero.intelligence}</span>
                            </div>
                            <Progress value={hero.intelligence} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Defense</span>
                              <span>{hero.defense}</span>
                            </div>
                            <Progress value={hero.defense} className="h-2" />
                          </div>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-white/20">
                          <span className="text-green-400">{hero.total_wins}W</span>
                          <span className="text-red-400">{hero.total_losses}L</span>
                          <span className="text-gray-400">{hero.total_wins + hero.total_losses} Battles</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="tournaments" className="space-y-4">
            {tournaments.length === 0 ? (
              <Card className="bg-black/40">
                <CardContent className="p-8 text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-400">No active tournaments at the moment</p>
                </CardContent>
              </Card>
            ) : (
              tournaments.map((tournament) => (
                <Card key={tournament.id} className="bg-black/40 border-yellow-500/30 hover:border-yellow-500/60 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{tournament.name}</h3>
                        <p className="text-sm text-gray-400">Prize Pool: €{tournament.prize_pool.toLocaleString()}</p>
                      </div>
                      <Badge className={tournament.status === 'registration' ? 'bg-green-500' : 'bg-blue-500'}>
                        {tournament.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-400">Entry Fee</div>
                        <div className="font-bold">{tournament.entry_fee} credits</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Participants</div>
                        <div className="font-bold">{tournament.current_teams}/{tournament.max_teams}</div>
                      </div>
                    </div>

                    <Progress value={(tournament.current_teams / tournament.max_teams) * 100} className="mb-4" />

                    {tournament.status === 'registration' && myHeroes.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {myHeroes.map((hero) => (
                          <Button
                            key={hero.id}
                            onClick={() => handleJoinTournament(tournament.id, hero.id)}
                            size="sm"
                            variant="outline"
                            className="border-yellow-500/50 hover:bg-yellow-500/20"
                          >
                            Join with {hero.name}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <Card className="bg-black/40">
              <CardHeader>
                <CardTitle>Top Heroes</CardTitle>
                <CardDescription>The strongest heroes in the universe</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topHeroes.map((hero, index) => (
                    <div key={hero.id} className="flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="text-2xl font-bold text-gray-400 w-8">#{index + 1}</div>
                      <div className="flex-1">
                        <div className="font-bold">{hero.name}</div>
                        <div className="text-sm text-gray-400">
                          {hero.power_type.toUpperCase()} • Level {hero.level}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-yellow-500">{hero.power_level}</div>
                        <div className="text-xs text-gray-400">{hero.total_wins}W / {hero.total_losses}L</div>
                      </div>
                      <Badge className={`bg-gradient-to-r ${getRarityColor(hero.rarity)}`}>
                        {hero.rarity.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SuperHeroUniverseFunctional;
