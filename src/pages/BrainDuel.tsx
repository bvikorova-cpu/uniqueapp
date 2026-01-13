import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, Zap, Users, ShoppingCart, Crown, Flame, Clock, 
  Globe, BookOpen, FlaskConical, Film, Dumbbell, Music, 
  Pizza, Briefcase, Palette, Gamepad2, Target, Brain,
  TrendingUp, Heart, Sparkles, User, Radio
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { BrainDuelCreditsDisplay } from "@/components/brain-duel/BrainDuelCreditsDisplay";
import { BrainDuelGame } from "@/components/brain-duel/BrainDuelGame";
import { BrainDuelLeaderboard } from "@/components/brain-duel/BrainDuelLeaderboard";
import { FriendChallenges } from "@/components/brain-duel/FriendChallenges";
import FriendChallengesLeaderboard from "@/components/brain-duel/FriendChallengesLeaderboard";
import { GameModeSelector } from "@/components/brain-duel/GameModeSelector";
import { LeagueSystem } from "@/components/brain-duel/LeagueSystem";
import { QuestionPackStore } from "@/components/brain-duel/QuestionPackStore";
import { LiveSpectatorMode } from "@/components/brain-duel/LiveSpectatorMode";
import { useBrainDuelPowerups } from "@/hooks/useBrainDuelPowerups";
import { useBrainDuelOnlinePlayers } from "@/hooks/useBrainDuelOnlinePlayers";
import { useBrainDuelRealTimeNotifications } from "@/hooks/useBrainDuelRealTimeNotifications";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const BrainDuel = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const { purchasePowerup, isPurchasing } = useBrainDuelPowerups();
  const { onlineCount } = useBrainDuelOnlinePlayers();
  
  // Enable real-time notifications
  useBrainDuelRealTimeNotifications();

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
      toast.error('Payment was cancelled');
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
        toast.success(`Success! Added ${data.added} credits. Total: ${data.credits}`);
        queryClient.invalidateQueries({ queryKey: ['brain-duel-credits'] });
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Error verifying payment');
    }
  };

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

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="container mx-auto max-w-7xl pt-16 sm:pt-20">
        {/* Hero Section */}
        <div className="text-center mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-4">
            <div className="hidden sm:block flex-1" />
            <div className="inline-flex items-center gap-2 flex-wrap justify-center">
              <Badge variant="secondary" className="text-xs sm:text-sm">Live Now</Badge>
              <Badge variant="outline" className="text-xs sm:text-sm">
                <Flame className="w-3 h-3 mr-1 text-orange-500" />
                {onlineCount} {onlineCount === 1 ? 'player' : 'players'} online
              </Badge>
            </div>
            <div className="sm:flex-1 flex justify-center sm:justify-end">
              {userId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/profile/${userId}?tab=brain-duel`)}
                  className="gap-2 text-xs sm:text-sm"
                >
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                  My Stats
                </Button>
              )}
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            BrainDuel
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-4">
            Knowledge Battle Arena • Virtual Competition
          </p>
          
          {/* How It Works Section */}
          <div className="bg-muted/50 rounded-xl p-4 sm:p-6 max-w-4xl mx-auto mb-6 text-left">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <span className="text-primary">🧠</span> How BrainDuel Works
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm sm:text-base text-muted-foreground">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <span><strong>Choose a Category:</strong> Select from 10+ knowledge categories like Science, History, Geography, Entertainment, and more.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <span><strong>Find an Opponent:</strong> Get matched with another player in real-time for a head-to-head quiz battle.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <span><strong>Answer Questions:</strong> Race against time to answer multiple-choice questions correctly and score points.</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">4.</span>
                  <span><strong>Use Power-ups:</strong> Activate special abilities like 50/50, Extra Time, or Hints to gain an advantage.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">5.</span>
                  <span><strong>Win Credits:</strong> Beat your opponent to win virtual credits. The winner takes all!</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">6.</span>
                  <span><strong>Challenge Friends:</strong> Create private matches with friends and compete for bragging rights.</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-xs sm:text-sm text-muted-foreground">
                <strong>💡 Tip:</strong> Each game costs credits to enter based on mode. Win to earn rewards! Purchase credit packages or earn them by winning matches.
              </p>
            </div>
          </div>
        </div>

        {/* Credits Display */}
        <div className="max-w-3xl mx-auto mb-8 space-y-6">
          <BrainDuelCreditsDisplay />
          <BrainDuelGame />
        </div>

        {/* Leaderboard and Friend Challenges */}
        <div className="max-w-6xl mx-auto mb-8 grid md:grid-cols-1 lg:grid-cols-2 gap-6">
          <BrainDuelLeaderboard />
          <div className="space-y-6">
            <FriendChallenges />
            <FriendChallengesLeaderboard />
          </div>
        </div>

        <Tabs defaultValue="play" className="w-full">
          <TabsList className="flex w-full overflow-x-auto gap-1 sm:gap-2 h-auto bg-muted p-1 sm:p-2 mb-4 sm:mb-6">
            <TabsTrigger value="play" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 flex-shrink-0">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Play Now</span>
              <span className="sm:hidden">Play</span>
            </TabsTrigger>
            <TabsTrigger value="leagues" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 flex-shrink-0">
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Leagues</span>
              <span className="sm:hidden">League</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 flex-shrink-0">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Challenges</span>
              <span className="sm:hidden">Chal</span>
            </TabsTrigger>
            <TabsTrigger value="powerups" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 flex-shrink-0">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Power-ups</span>
              <span className="sm:hidden">Power</span>
            </TabsTrigger>
            <TabsTrigger value="packs" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 flex-shrink-0">
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Question Packs</span>
              <span className="sm:hidden">Packs</span>
            </TabsTrigger>
            <TabsTrigger value="audience" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 flex-shrink-0">
              <Radio className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Live Audience</span>
              <span className="sm:hidden">Live</span>
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

            {/* Game Mode Selector */}
            <GameModeSelector onSelectMode={(mode) => {
              toast.info(`Selected ${mode.name} mode`, {
                description: `${mode.questions} questions, ${mode.entry} credits entry`
              });
            }} />

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Question Categories</CardTitle>
                <CardDescription>
                  Choose your expertise or challenge yourself with mixed categories
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Button
                        key={category.id}
                        variant="outline"
                        className="h-auto min-h-[70px] sm:min-h-[80px] py-2 sm:py-4 flex-col gap-1 sm:gap-2 px-2 sm:px-3 whitespace-normal"
                      >
                        <Icon className={`h-4 w-4 sm:h-6 sm:w-6 flex-shrink-0 ${category.color}`} />
                        <span className="text-[9px] sm:text-xs font-medium text-center leading-tight break-words">{category.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leagues Tab */}
          <TabsContent value="leagues" className="space-y-6">
            <LeagueSystem />
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
                  <Card key={powerUp.id} className="hover:shadow-lg transition-all">
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
            <QuestionPackStore />
          </TabsContent>

          {/* Live Audience Tab */}
          <TabsContent value="audience" className="space-y-6">
            <LiveSpectatorMode />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BrainDuel;
