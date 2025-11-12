import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, Zap, Users, ShoppingCart, Crown, Flame, Clock, 
  Globe, BookOpen, FlaskConical, Film, Dumbbell, Music, 
  Pizza, Briefcase, Palette, Gamepad2, Target, Brain,
  TrendingUp, Heart, Sparkles, Gift, User
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { BrainDuelCreditsDisplay } from "@/components/brain-duel/BrainDuelCreditsDisplay";
import { BrainDuelGame } from "@/components/brain-duel/BrainDuelGame";
import { BrainDuelLeaderboard } from "@/components/brain-duel/BrainDuelLeaderboard";
import { FriendChallenges } from "@/components/brain-duel/FriendChallenges";
import { useBrainDuelPowerups } from "@/hooks/useBrainDuelPowerups";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const BrainDuel = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const { purchasePowerup, isPurchasing } = useBrainDuelPowerups();

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Handle payment success
  useEffect(() => {
    const payment = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');

    if (payment === 'success' && sessionId) {
      handlePaymentSuccess(sessionId);
      // Clean up URL
      searchParams.delete('payment');
      searchParams.delete('session_id');
      setSearchParams(searchParams);
    } else if (payment === 'cancelled') {
      toast.error('Platba bola zrušená');
      searchParams.delete('payment');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const handlePaymentSuccess = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-brain-duel-payment', {
        body: { sessionId },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Úspešne! Pridaných ${data.added} kreditov. Celkom: ${data.credits}`);
        queryClient.invalidateQueries({ queryKey: ['brain-duel-credits'] });
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Chyba pri overovaní platby');
    }
  };

  const gameModes = [
    {
      id: "quick",
      name: "Quick Duel",
      duration: "5 minutes",
      questions: 10,
      timePerQuestion: "30s",
      entry: 10,
      reward: 20,
      icon: Zap,
      color: "text-yellow-500"
    },
    {
      id: "classic",
      name: "Classic Battle",
      duration: "10 minutes",
      questions: 20,
      timePerQuestion: "30s",
      entry: 20,
      reward: 50,
      icon: Trophy,
      color: "text-blue-500"
    },
    {
      id: "championship",
      name: "Championship",
      duration: "20 minutes",
      questions: 50,
      timePerQuestion: "24s",
      entry: 50,
      reward: 150,
      icon: Crown,
      color: "text-purple-500",
      featured: true
    }
  ];

  const tournaments = [
    {
      id: "bronze",
      name: "Bronze League",
      entry: 10,
      description: "Beginners",
      color: "bg-amber-700",
      icon: "🥉"
    },
    {
      id: "silver",
      name: "Silver League",
      entry: 20,
      description: "Advanced",
      color: "bg-slate-400",
      icon: "🥈"
    },
    {
      id: "gold",
      name: "Gold League",
      entry: 50,
      description: "Experts",
      color: "bg-yellow-500",
      icon: "🥇"
    },
    {
      id: "diamond",
      name: "Diamond League",
      entry: 100,
      description: "Professionals",
      color: "bg-cyan-400",
      icon: "💎",
      featured: true
    }
  ];

  const categories = [
    { id: "geography", name: "Geography", icon: Globe, color: "text-green-500" },
    { id: "history", name: "History", icon: BookOpen, color: "text-amber-600" },
    { id: "science", name: "Science & Tech", icon: FlaskConical, color: "text-blue-500" },
    { id: "film", name: "Film & TV", icon: Film, color: "text-red-500" },
    { id: "sports", name: "Sports", icon: Dumbbell, color: "text-orange-500" },
    { id: "music", name: "Music", icon: Music, color: "text-purple-500" },
    { id: "food", name: "Food & Drinks", icon: Pizza, color: "text-pink-500" },
    { id: "business", name: "Business & Economy", icon: Briefcase, color: "text-slate-600" },
    { id: "art", name: "Art & Culture", icon: Palette, color: "text-violet-500" },
    { id: "gaming", name: "Gaming & Pop Culture", icon: Gamepad2, color: "text-cyan-500" }
  ];

  const powerUps = [
    {
      id: "fifty-fifty",
      name: "50:50",
      description: "Remove 2 wrong answers",
      price: 5,
      icon: Target,
      color: "text-yellow-500"
    },
    {
      id: "ask-ai",
      name: "Ask AI",
      description: "AI hint for the answer",
      price: 3,
      icon: Brain,
      color: "text-blue-500"
    },
    {
      id: "extra-time",
      name: "Extra Time",
      description: "+15 seconds bonus",
      price: 2,
      icon: Clock,
      color: "text-green-500"
    },
    {
      id: "double-points",
      name: "Double Points",
      description: "2× credits from this question",
      price: 10,
      icon: TrendingUp,
      color: "text-purple-500"
    }
  ];

  const questionPacks = [
    {
      id: "celebrity",
      name: "Celebrity Pack",
      questions: 100,
      price: 30,
      category: "Entertainment"
    },
    {
      id: "history",
      name: "History Bundle",
      questions: 200,
      price: 50,
      category: "History"
    },
    {
      id: "science",
      name: "Science Mega Pack",
      questions: 300,
      price: 80,
      category: "Science"
    },
    {
      id: "custom",
      name: "Create Custom Pack",
      questions: "Unlimited",
      price: "1 credit/question",
      category: "Custom",
      custom: true
    }
  ];

  const handleStartGame = (modeId: string) => {
    toast.info(`Starting ${gameModes.find(m => m.id === modeId)?.name}...`, {
      description: "Finding an opponent for you"
    });
  };

  const handleJoinTournament = (tournamentId: string) => {
    toast.info(`Joining ${tournaments.find(t => t.id === tournamentId)?.name}...`, {
      description: "Waiting for tournament to start"
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-7xl pt-20">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1" />
            <div className="inline-flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">Live Now</Badge>
              <Badge variant="outline" className="text-sm">
                <Flame className="w-3 h-3 mr-1 text-orange-500" />
                1,234 players online
              </Badge>
            </div>
            <div className="flex-1 flex justify-end">
              {userId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/profile/${userId}?tab=brain-duel`)}
                  className="gap-2"
                >
                  <User className="h-4 w-4" />
                  My Stats
                </Button>
              )}
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            BrainDuel
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Knowledge Battle Arena • Virtual Competition
          </p>
          <p className="text-sm text-muted-foreground">
            Test Your Knowledge • Compete for Virtual Credits
          </p>
        </div>

        {/* Credits Display */}
        <div className="max-w-3xl mx-auto mb-8 space-y-6">
          <BrainDuelCreditsDisplay />
          <BrainDuelGame />
        </div>

        {/* Leaderboard and Friend Challenges */}
        <div className="max-w-6xl mx-auto mb-8 grid md:grid-cols-1 lg:grid-cols-2 gap-6">
          <BrainDuelLeaderboard />
          <FriendChallenges />
        </div>

        <Tabs defaultValue="play" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 gap-2 h-auto bg-muted p-2 mb-6">
            <TabsTrigger value="play" className="gap-2">
              <Zap className="h-4 w-4" />
              Play Now
            </TabsTrigger>
            <TabsTrigger value="tournaments" className="gap-2">
              <Trophy className="h-4 w-4" />
              Tournaments
            </TabsTrigger>
            <TabsTrigger value="challenges" className="gap-2">
              <Users className="h-4 w-4" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="powerups" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Power-ups
            </TabsTrigger>
            <TabsTrigger value="packs" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Question Packs
            </TabsTrigger>
            <TabsTrigger value="audience" className="gap-2">
              <Users className="h-4 w-4" />
              Live Audience
            </TabsTrigger>
          </TabsList>

          {/* Play Now Tab */}
          <TabsContent value="play" className="space-y-6">
            {/* Virtual Game Info */}
            <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-purple-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Virtual Competition System
                </CardTitle>
                <CardDescription>
                  Play for fun • Win virtual credits • No real money involved
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Compete against other players in knowledge battles. Winners earn virtual credits that can be used within the game. 
                  All credits are for entertainment purposes only and have no real-world monetary value.
                </p>
              </CardContent>
            </Card>

            {/* Game Modes */}
            <div className="grid md:grid-cols-3 gap-4">
              {gameModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <Card 
                    key={mode.id}
                    className={`relative hover:shadow-elegant transition-all ${
                      mode.featured ? 'border-primary/50 ring-2 ring-primary/20' : ''
                    }`}
                  >
                    {mode.featured && (
                      <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-bold">
                        POPULAR
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${mode.color}`} />
                        {mode.name}
                      </CardTitle>
                      <CardDescription>
                        {mode.duration} • {mode.questions} questions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Time per question:</span>
                          <span className="font-medium">{mode.timePerQuestion}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Entry cost:</span>
                          <span className="font-bold text-primary">{mode.entry} credits</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Win reward:</span>
                          <span className="font-bold text-green-500">{mode.reward} credits</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full"
                        onClick={() => handleStartGame(mode.id)}
                      >
                        Start Battle
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Question Categories</CardTitle>
                <CardDescription>
                  Choose your expertise or challenge yourself with mixed categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Button
                        key={category.id}
                        variant="outline"
                        className="h-auto py-4 flex-col gap-2"
                      >
                        <Icon className={`h-6 w-6 ${category.color}`} />
                        <span className="text-xs font-medium">{category.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tournaments Tab */}
          <TabsContent value="tournaments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tiered Tournaments</CardTitle>
                <CardDescription>
                  Compete in your skill level and climb the ranks
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              {tournaments.map((tournament) => (
                <Card 
                  key={tournament.id}
                  className={`relative ${
                    tournament.featured ? 'border-primary/50 ring-2 ring-primary/20' : ''
                  }`}
                >
                  {tournament.featured && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-purple-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                      ELITE
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${tournament.color} rounded-full flex items-center justify-center text-2xl`}>
                        {tournament.icon}
                      </div>
                      <div>
                        <div>{tournament.name}</div>
                        <div className="text-sm font-normal text-muted-foreground">
                          {tournament.description}
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Entry cost:</span>
                      <span className="text-2xl font-bold text-primary">{tournament.entry} credits</span>
                    </div>
                    <Button className="w-full" onClick={() => handleJoinTournament(tournament.id)}>
                      Join Tournament
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Friend Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            <FriendChallenges />
          </TabsContent>

          {/* Power-ups Tab */}
          <TabsContent value="powerups" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>In-Game Power-ups</CardTitle>
                <CardDescription>
                  Boost your chances during battles with special abilities
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {powerUps.map((powerUp) => {
                const Icon = powerUp.icon;
                return (
                  <Card key={powerUp.id} className="hover:shadow-elegant transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Icon className={`h-5 w-5 ${powerUp.color}`} />
                        {powerUp.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{powerUp.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-primary">{powerUp.price} credits</span>
                        <Button 
                          size="sm"
                          onClick={() => purchasePowerup({ type: powerUp.id, price: powerUp.price })}
                          disabled={isPurchasing}
                        >
                          Buy
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Question Packs Tab */}
          <TabsContent value="packs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Question Packs</CardTitle>
                <CardDescription>
                  Expand your question library with themed packs or create your own
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              {questionPacks.map((pack) => (
                <Card 
                  key={pack.id}
                  className={`hover:shadow-elegant transition-all ${
                    pack.custom ? 'border-primary/50 bg-gradient-to-br from-primary/5 to-purple-500/5' : ''
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {pack.custom ? <Gift className="h-5 w-5 text-primary" /> : <ShoppingCart className="h-5 w-5" />}
                      {pack.name}
                    </CardTitle>
                    <CardDescription>
                      {pack.category} • {pack.questions} questions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-primary">
                        {typeof pack.price === 'number' ? `${pack.price} credits` : pack.price}
                      </span>
                      <Button>
                        {pack.custom ? 'Create Pack' : 'Purchase'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Live Audience Tab */}
          <TabsContent value="audience" className="space-y-6">
            <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-purple-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Live Spectator Mode
                </CardTitle>
                <CardDescription>
                  Watch live battles and support your favorite players
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="text-sm text-muted-foreground">Live battles:</span>
                    <span className="font-bold">Watch for free</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="text-sm text-muted-foreground">Chat access:</span>
                    <span className="font-bold text-green-500">Free</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="text-sm text-muted-foreground">Reactions:</span>
                    <span className="font-bold text-purple-500">Unlimited</span>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    Virtual Gifts
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Send virtual gifts to players during battles (costs virtual credits)
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">❤️ 5 credits</Badge>
                    <Badge variant="outline">🎁 10 credits</Badge>
                    <Badge variant="outline">🏆 20 credits</Badge>
                    <Badge variant="outline">👑 50 credits</Badge>
                    <Badge variant="outline">💎 100 credits</Badge>
                  </div>
                </div>

                <Button className="w-full mt-4" size="lg">
                  Watch Live Battles
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BrainDuel;
