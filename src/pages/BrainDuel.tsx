import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, Zap, Users, ShoppingCart, Crown, Clock, 
  Globe, BookOpen, FlaskConical, Film, Dumbbell, Music, 
  Pizza, Briefcase, Palette, Gamepad2, Target, Brain,
  TrendingUp, Sparkles, User, Radio, ChevronRight,
  Swords, Calendar, Bot, BarChart3, Loader2
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { BrainDuelCreditsDisplay } from "@/components/brain-duel/BrainDuelCreditsDisplay";
import { BrainDuelGame } from "@/components/brain-duel/BrainDuelGame";
// BrainDuelLeaderboard import removed — not used on this page (AnimatedLeaderboard is used instead)
import { FriendChallenges } from "@/components/brain-duel/FriendChallenges";
import FriendChallengesLeaderboard from "@/components/brain-duel/FriendChallengesLeaderboard";
import { GameModeSelector } from "@/components/brain-duel/GameModeSelector";
import { LeagueSystem } from "@/components/brain-duel/LeagueSystem";
import { QuestionPackStore } from "@/components/brain-duel/QuestionPackStore";
import { LiveSpectatorMode } from "@/components/brain-duel/LiveSpectatorMode";
import { BrainDuelHero } from "@/components/brain-duel/BrainDuelHero";
import { PlayerStatsDisplay } from "@/components/brain-duel/PlayerStatsDisplay";
import { DailyStreak } from "@/components/brain-duel/DailyStreak";
import { BonusRoundCard, MysteryCategory, CustomChallenge } from "@/components/brain-duel/GameplayEnhancements";
import { WeeklyTournaments } from "@/components/brain-duel/WeeklyTournaments";
import { DailySpinWheel } from "@/components/brain-duel/DailySpinWheel";
import { MatchReplay } from "@/components/brain-duel/MatchReplay";
import { SeasonPass } from "@/components/brain-duel/SeasonPass";
import { AIOpponent } from "@/components/brain-duel/AIOpponent";
import { NotificationCenter } from "@/components/brain-duel/NotificationCenter";
import { DuelHistoryStats } from "@/components/brain-duel/DuelHistoryStats";
import { ReferralSystem } from "@/components/brain-duel/ReferralSystem";
import { AnimatedLeaderboard } from "@/components/brain-duel/AnimatedLeaderboard";
import { AIWeeklyRecap } from "@/components/brain-duel/AIWeeklyRecap";
import { RankAvatarSystem } from "@/components/brain-duel/RankAvatarSystem";
import { PowerUpCombos } from "@/components/brain-duel/PowerUpCombos";
import { SeasonalThemes } from "@/components/brain-duel/SeasonalThemes";
import { AchievementAnimation } from "@/components/brain-duel/AchievementAnimation";
import { DailyChallenges } from "@/components/brain-duel/DailyChallenges";
import { useBrainDuelPowerups } from "@/hooks/useBrainDuelPowerups";
import { useBrainDuelOnlinePlayers } from "@/hooks/useBrainDuelOnlinePlayers";
import { useBrainDuelRealTimeNotifications } from "@/hooks/useBrainDuelRealTimeNotifications";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
const BrainDuel = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const { purchasePowerup, isPurchasing } = useBrainDuelPowerups();
  const { onlineCount } = useBrainDuelOnlinePlayers();
  
  useBrainDuelRealTimeNotifications();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    const payment = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');
    if (payment === 'success' && sessionId) {
      handlePaymentSuccess(sessionId);
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
        const next = new URLSearchParams(searchParams);
        next.delete('payment'); next.delete('session_id');
        setSearchParams(next, { replace: true });
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Could not verify payment', {
        description: 'We were unable to confirm your purchase. Tap retry or contact support if you were charged.',
        action: { label: 'Retry', onClick: () => handlePaymentSuccess(sessionId) },
        duration: 15000,
      });
    }
  };

  const categories = [
    { id: "geography", name: "Geography", icon: Globe, color: "text-emerald-400", bg: "from-emerald-500/20 to-emerald-600/10" },
    { id: "history", name: "History", icon: BookOpen, color: "text-amber-400", bg: "from-amber-500/20 to-amber-600/10" },
    { id: "science", name: "Science & Tech", icon: FlaskConical, color: "text-cyan-400", bg: "from-cyan-500/20 to-cyan-600/10" },
    { id: "film", name: "Film & TV", icon: Film, color: "text-rose-400", bg: "from-rose-500/20 to-rose-600/10" },
    { id: "sports", name: "Sports", icon: Dumbbell, color: "text-orange-400", bg: "from-orange-500/20 to-orange-600/10" },
    { id: "music", name: "Music", icon: Music, color: "text-violet-400", bg: "from-violet-500/20 to-violet-600/10" },
    { id: "food", name: "Food & Drinks", icon: Pizza, color: "text-pink-400", bg: "from-pink-500/20 to-pink-600/10" },
    { id: "business", name: "Business", icon: Briefcase, color: "text-slate-400", bg: "from-slate-500/20 to-slate-600/10" },
    { id: "art", name: "Art & Culture", icon: Palette, color: "text-fuchsia-400", bg: "from-fuchsia-500/20 to-fuchsia-600/10" },
    { id: "gaming", name: "Gaming", icon: Gamepad2, color: "text-sky-400", bg: "from-sky-500/20 to-sky-600/10" }
  ];

  const powerUps = [
    { id: "fifty-fifty", name: "50:50", description: "Remove 2 wrong answers", price: 5, icon: Target, color: "text-yellow-400", glow: "shadow-yellow-500/20" },
    { id: "ask-ai", name: "Ask AI", description: "AI hint for the answer", price: 3, icon: Brain, color: "text-blue-400", glow: "shadow-blue-500/20" },
    { id: "extra-time", name: "Extra Time", description: "+15 seconds bonus", price: 2, icon: Clock, color: "text-green-400", glow: "shadow-green-500/20" },
    { id: "double-points", name: "Double Points", description: "2× credits from this question", price: 10, icon: TrendingUp, color: "text-purple-400", glow: "shadow-purple-500/20" }
  ];

  const howItWorks = [
    { step: "01", title: "Choose Category", desc: "Pick from 10+ knowledge topics", icon: BookOpen },
    { step: "02", title: "Find Opponent", desc: "Real-time matchmaking", icon: Users },
    { step: "03", title: "Answer Fast", desc: "Race against the clock", icon: Zap },
    { step: "04", title: "Win Credits", desc: "Winner takes the pot!", icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Achievement Animation Overlay */}
      <AchievementAnimation />

      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-violet-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto max-w-7xl pt-20 sm:pt-24 px-3 sm:px-4 relative z-10">
        
        {/* ===== NEON HERO ===== */}
        <BrainDuelHero onlineCount={onlineCount} userId={userId} />

        <div className="max-w-4xl mx-auto mb-6 flex justify-center">
          <button
            onClick={() => navigate("/brain-duel/hub")}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold shadow-lg hover:opacity-90 transition"
          >
            ✨ Open Brain Duel Hub — 12 new features
          </button>
        </div>

        <HeroRewardedAd sectionKey="page_brainduel" />

        {/* ===== SEASONAL THEME BANNER ===== */}
        <div className="max-w-4xl mx-auto mb-6">
          <SeasonalThemes />
        </div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto mb-8"
        >
          {howItWorks.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="relative group"
              >
                <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 text-center hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                  <div className="text-[10px] font-bold text-primary/50 mb-2">{item.step}</div>
                  <Icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-xs sm:text-sm font-semibold text-foreground">{item.title}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">{item.desc}</div>
                </div>
                {i < howItWorks.length - 1 && (
                  <ChevronRight className="hidden sm:block absolute top-1/2 -right-3.5 w-4 h-4 text-muted-foreground/30 -translate-y-1/2" />
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* My Stats button */}
        {userId && (
          <div className="flex justify-center mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/profile/${userId}?tab=brain-duel`)}
              className="gap-2 text-xs sm:text-sm backdrop-blur-sm"
            >
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              My Full Stats
            </Button>
          </div>
        )}

        {/* ===== XP & ELO + STREAK ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-4xl mx-auto mb-8 space-y-4"
        >
          <PlayerStatsDisplay />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DailyStreak />
            <RankAvatarSystem />
            <div className="space-y-4">
              <BrainDuelCreditsDisplay />
              <BonusRoundCard />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PowerUpCombos />
            <DailyChallenges />
          </div>
          <DailySpinWheel />
        </motion.div>

        {/* ===== NOTIFICATIONS ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <NotificationCenter />
        </motion.div>
        <motion.div
          id="brain-duel-game-anchor"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="max-w-3xl mx-auto mb-10 scroll-mt-24"
        >
          <BrainDuelGame />
        </motion.div>

        {/* ===== ANIMATED LEADERBOARD & FRIENDS ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="max-w-6xl mx-auto mb-10 grid md:grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <AnimatedLeaderboard />
          <div className="space-y-6">
            <FriendChallenges />
            <FriendChallengesLeaderboard />
          </div>
        </motion.div>

        {/* ===== DUEL HISTORY & REFERRAL ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="max-w-6xl mx-auto mb-10 grid md:grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <DuelHistoryStats />
          <ReferralSystem />
        </motion.div>

        {/* ===== AI WEEKLY RECAP ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.68 }}
          className="max-w-4xl mx-auto mb-10"
        >
          <AIWeeklyRecap />
        </motion.div>

        {/* ===== TABS ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Tabs defaultValue="play" className="w-full">
            <TabsList className="flex w-full overflow-x-auto gap-1 h-auto bg-card/60 backdrop-blur-md border border-border/50 p-1.5 sm:p-2 mb-6 rounded-2xl">
              <TabsTrigger value="play" className="gap-1.5 text-xs sm:text-sm px-3 sm:px-4 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all flex-shrink-0">
                <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Play Now</span>
                <span className="sm:hidden">Play</span>
              </TabsTrigger>
              <TabsTrigger value="leagues" className="gap-1.5 text-xs sm:text-sm px-3 sm:px-4 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all flex-shrink-0">
                <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Leagues
              </TabsTrigger>
              <TabsTrigger value="tournaments" className="gap-1.5 text-xs sm:text-sm px-3 sm:px-4 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all flex-shrink-0">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Tournaments
              </TabsTrigger>
              <TabsTrigger value="custom" className="gap-1.5 text-xs sm:text-sm px-3 sm:px-4 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all flex-shrink-0">
                <Swords className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Custom
              </TabsTrigger>
              <TabsTrigger value="powerups" className="gap-1.5 text-xs sm:text-sm px-3 sm:px-4 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all flex-shrink-0">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Power-ups
              </TabsTrigger>
              <TabsTrigger value="packs" className="gap-1.5 text-xs sm:text-sm px-3 sm:px-4 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all flex-shrink-0">
                <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Packs
              </TabsTrigger>
              <TabsTrigger value="audience" className="gap-1.5 text-xs sm:text-sm px-3 sm:px-4 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all flex-shrink-0">
                <Radio className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Live
              </TabsTrigger>
              <TabsTrigger value="season" className="gap-1.5 text-xs sm:text-sm px-3 sm:px-4 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all flex-shrink-0">
                <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Season</span>
                <span className="sm:hidden">Pass</span>
              </TabsTrigger>
              <TabsTrigger value="ai-training" className="gap-1.5 text-xs sm:text-sm px-3 sm:px-4 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all flex-shrink-0">
                <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">AI Training</span>
                <span className="sm:hidden">AI</span>
              </TabsTrigger>
              <TabsTrigger value="replay" className="gap-1.5 text-xs sm:text-sm px-3 sm:px-4 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all flex-shrink-0">
                <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Replay
              </TabsTrigger>
            </TabsList>

            {/* Play Now Tab */}
            <TabsContent value="play" className="space-y-6">
              <Card className="relative overflow-hidden border-primary/20">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-violet-500/5 to-cyan-500/5" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                    Virtual Competition System
                  </CardTitle>
                  <CardDescription>
                    Play for fun • Win virtual credits • No real money involved
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-sm text-muted-foreground">
                    Compete against other players in knowledge battles. Winners earn virtual credits that can be used within the game. 
                    All credits are for entertainment purposes only and have no real-world monetary value.
                  </p>
                </CardContent>
              </Card>

              <GameModeSelector onSelectMode={(mode) => {
                toast.success(`${mode.name} mode selected`, {
                  description: `${mode.questions} questions, ${mode.entry} credits entry. Scroll up to start a duel!`,
                });
                document.getElementById("brain-duel-game-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }} />

              {/* Mystery Category */}
              <MysteryCategory />

              {/* Categories */}
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    Question Categories
                  </CardTitle>
                  <CardDescription>Choose your expertise or go random for a surprise</CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
                    {categories.map((category, i) => {
                      const Icon = category.icon;
                      return (
                        <motion.div
                          key={category.id}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Button
                            variant="outline"
                            className={`h-auto min-h-[80px] sm:min-h-[90px] py-3 sm:py-4 flex-col gap-2 px-2 sm:px-3 whitespace-normal w-full bg-gradient-to-br ${category.bg} border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300`}
                            onClick={() => {
                              toast.success(`${category.name} selected`, {
                                description: "Choose this category in the duel panel above to start playing.",
                              });
                              document.getElementById("brain-duel-game-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }}
                          >
                            <div className="p-2 rounded-xl bg-background/50">
                              <Icon className={`h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 ${category.color}`} />
                            </div>
                            <span className="text-[10px] sm:text-xs font-semibold text-center leading-tight">{category.name}</span>
                          </Button>
                        </motion.div>
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

            {/* Tournaments Tab */}
            <TabsContent value="tournaments" className="space-y-6">
              <WeeklyTournaments />
            </TabsContent>

            {/* Custom Challenges Tab */}
            <TabsContent value="custom" className="space-y-6">
              <CustomChallenge />
              <FriendChallenges />
            </TabsContent>

            {/* Power-ups Tab */}
            <TabsContent value="powerups" className="space-y-6">
              <Card className="relative overflow-hidden border-primary/20">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-violet-500/5 to-transparent" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    In-Game Power-ups
                  </CardTitle>
                  <CardDescription>Boost your chances during battles with special abilities</CardDescription>
                </CardHeader>
              </Card>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {powerUps.map((powerUp, i) => {
                  const Icon = powerUp.icon;
                  return (
                    <motion.div
                      key={powerUp.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ y: -4 }}
                    >
                      <Card className={`hover:shadow-xl ${powerUp.glow} transition-all duration-300 h-full`}>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <div className="p-2 rounded-xl bg-muted">
                              <Icon className={`h-5 w-5 ${powerUp.color}`} />
                            </div>
                            {powerUp.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground">{powerUp.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-bold text-primary">{powerUp.price} <span className="text-xs font-normal text-muted-foreground">credits</span></span>
                            <Button 
                              size="sm"
                              onClick={() => purchasePowerup({ type: powerUp.id, price: powerUp.price })}
                              disabled={isPurchasing}
                              className="shadow-lg shadow-primary/20"
                            >
                              {isPurchasing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Buy"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
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

            {/* Season Pass Tab */}
            <TabsContent value="season" className="space-y-6">
              <SeasonPass />
            </TabsContent>

            {/* AI Training Tab */}
            <TabsContent value="ai-training" className="space-y-6">
              <AIOpponent />
            </TabsContent>

            {/* Match Replay Tab */}
            <TabsContent value="replay" className="space-y-6">
              <MatchReplay />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Tip */}
        <div className="max-w-3xl mx-auto mt-8 mb-12">
          <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-4 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">
              <span className="text-primary font-semibold">💡 Tip:</span> Each game costs credits to enter. Win to earn rewards! Complete daily challenges and maintain your streak for bonus multipliers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrainDuel;
