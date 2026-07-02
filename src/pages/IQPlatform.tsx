import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Trophy, LineChart, Zap, Users, Target, BarChart3, Medal, FlaskConical, ArrowRight } from "lucide-react";
import { IQCreditsDisplay } from "@/components/iq/IQCreditsDisplay";
import IQPlatformHero from "@/components/iq/IQPlatformHero";
import IQToolsGrid from "@/components/iq/IQToolsGrid";
import IQLeaguesSection from "@/components/iq/IQLeaguesSection";
import IQBrainStreaks from "@/components/iq/IQBrainStreaks";
import IQTournaments from "@/components/iq/IQTournaments";
import IQDuels from "@/components/iq/IQDuels";
import IQProgressCharts from "@/components/iq/IQProgressCharts";
import IQAchievements from "@/components/iq/IQAchievements";
import IQGlobalLeaderboard from "@/components/iq/IQGlobalLeaderboard";
import IQCountryLeaderboard from "@/components/iq/IQCountryLeaderboard";
import IQPerformanceInsights from "@/components/iq/IQPerformanceInsights";
import IQGoals from "@/components/iq/IQGoals";
import IQWeeklyRecap from "@/components/iq/IQWeeklyRecap";
import IQMilestones from "@/components/iq/IQMilestones";
import IQFriendCompare from "@/components/iq/IQFriendCompare";
import IQTrainingPlan from "@/components/iq/IQTrainingPlan";
import IQDailyChallenge from "@/components/iq/IQDailyChallenge";
import IQFriends from "@/components/iq/IQFriends";
import IQNotificationSettings from "@/components/iq/IQNotificationSettings";
import IQQuickLauncher from "@/components/iq/IQQuickLauncher";
import IQDailyStreak from "@/components/iq/IQDailyStreak";
import IQGlobalEventFeed from "@/components/iq/IQGlobalEventFeed";
import IQBattlePass from "@/components/iq/IQBattlePass";
import IQAICoach from "@/components/iq/IQAICoach";
import IQHallOfFame from "@/components/iq/IQHallOfFame";
import IQReferral from "@/components/iq/IQReferral";
import IQPromoCode from "@/components/iq/IQPromoCode";
import IQSubscription from "@/components/iq/IQSubscription";
import IQPublicProfileSettings from "@/components/iq/IQPublicProfileSettings";
import IQNotificationsBell from "@/components/iq/IQNotificationsBell";
import { trackIQEvent } from "@/lib/iqAnalytics";
import IQCertificate from "@/components/iq/IQCertificate";
import IQFriendChallenge from "@/components/iq/IQFriendChallenge";
import IQShareableCard from "@/components/iq/IQShareableCard";
import IQTestHistory from "@/components/iq/IQTestHistory";
import IQTestRunner from "@/components/iq/IQTestRunner";
import IQLiveSpectatorLobby from "@/components/iq/IQLiveSpectatorLobby";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIQUserStats, useIQGlobalCounts } from "@/hooks/useIQUserStats";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const IQPlatform = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [runner, setRunner] = useState<{ category: string; title: string; timeLimit: number } | null>(null);
  const { toast } = useToast();
  const { data: stats } = useIQUserStats();
  const { data: counts } = useIQGlobalCounts();

  const testCategories = [
    { id: "beginner", title: "Beginner IQ Test", description: "Perfect for first-time test takers", difficulty: "Beginner", questions: 30, timeLimit: 30, credits: 10, icon: Target },
    { id: "intermediate", title: "Intermediate IQ Test", description: "Standard IQ assessment", difficulty: "Intermediate", questions: 40, timeLimit: 45, credits: 15, icon: Brain },
    { id: "advanced", title: "Advanced IQ Test", description: "Challenging cognitive assessment", difficulty: "Advanced", questions: 50, timeLimit: 60, credits: 20, icon: Zap },
    { id: "expert", title: "Expert IQ Test", description: "Mensa-level difficulty", difficulty: "Expert", questions: 60, timeLimit: 75, credits: 25, icon: Trophy },
  ];

  const specializedCategories = [
    { id: "logical",   title: "Logical Reasoning",   desc: "Syllogisms & deduction",  icon: Brain,     credits: 8 },
    { id: "spatial",   title: "Spatial Awareness",   desc: "3D rotation, mental maps", icon: Target,   credits: 8 },
    { id: "verbal",    title: "Verbal Reasoning",    desc: "Analogies & vocabulary",   icon: Medal,    credits: 8 },
    { id: "numerical", title: "Numerical Reasoning", desc: "Sequences & arithmetic",   icon: BarChart3, credits: 8 },
    { id: "memory",    title: "Working Memory",      desc: "Recall & sequencing",      icon: Zap,      credits: 8 },
    { id: "pattern",   title: "Pattern Recognition", desc: "Visual abstract logic",    icon: LineChart, credits: 8 },
  ];

  useEffect(() => { trackIQEvent("iq_view"); }, []);

  useEffect(() => {
    if (activeTab !== "tests") return;
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const ids = [...testCategories.map(t => t.id), ...specializedCategories.map(t => t.id)];
      const results = await Promise.all(ids.map(async (id) => {
        const { data } = await supabase.rpc("iq_test_cooldown_remaining", { _category: id });
        return [id, Number(data ?? 0)] as const;
      }));
      if (!cancelled) setCooldowns(Object.fromEntries(results));
    })();
    return () => { cancelled = true; };
  }, [activeTab]);

  useEffect(() => {
    if (Object.values(cooldowns).every(v => v <= 0)) return;
    const t = setInterval(() => {
      setCooldowns(prev => {
        const next: Record<string, number> = {};
        for (const k in prev) next[k] = Math.max(0, prev[k] - 1);
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [cooldowns]);

  const formatCooldown = (s: number) => {
    if (s <= 0) return null;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const handleStartTest = async (testType: string) => {
    const test = [...testCategories, ...specializedCategories].find(t => t.id === testType);
    if (!test) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({ title: "Please login first", variant: "destructive" });
      return;
    }
    if ((cooldowns[testType] ?? 0) > 0) {
      toast({ title: "Cooldown active", description: `Try again in ${formatCooldown(cooldowns[testType])}.`, variant: "destructive" });
      return;
    }
    const tl = (test as any).timeLimit ?? 15;
    setRunner({ category: testType, title: (test as any).title ?? (test as any).desc ?? testType, timeLimit: tl });
  };

  return (
    <>
      <FloatingHowItWorks title="How IQPlatform works" steps={[
          { title: 'Explore', desc: 'Browse the learning content or tool.' },
          { title: 'Start / generate', desc: 'Take a course, quiz or AI action (2-5 credits where applicable).' },
          { title: 'Track progress', desc: 'Your XP, badges and completion are saved.' },
          { title: 'Level up', desc: 'Unlock next lessons, leaderboards and rewards.' },
        ]} />
      <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-6 mt-16 sm:mt-20">
      <IQPlatformHero
        totalTests={counts?.totalTests ?? 0}
        totalUsers={counts?.totalUsers ?? 0}
        userIQ={stats?.best_iq ?? null}
        streak={stats?.current_streak ?? 0}
      />
      <HeroRewardedAd sectionKey="page_iqplatform" />

      <div className="flex items-center justify-between gap-2">
        <IQCreditsDisplay />
        <IQNotificationsBell />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 sm:grid-cols-8 gap-1 h-auto p-1.5 bg-muted/50 rounded-xl">
          {[
            { value: "overview", label: "Overview", icon: Brain },
            { value: "tests", label: "IQ Tests", icon: Target },
            { value: "tools", label: "AI Tools", icon: Zap },
            { value: "duels", label: "Duels", icon: Users },
            { value: "tournaments", label: "Tournaments", icon: Trophy },
            { value: "leaderboard", label: "Leaderboard", icon: Medal },
            { value: "progress", label: "Progress", icon: BarChart3 },
            { value: "results", label: "Results", icon: LineChart },
          ].map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-[9px] sm:text-xs py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              <tab.icon className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/15 via-purple-500/10 to-pink-500/10 border-primary/30 hover:border-primary/60 transition-colors">
            <Link to="/iq-platform/lab" className="block">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-pink-500 text-white">
                    <FlaskConical className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                      Brain Lab <Badge className="bg-primary/20 text-primary border-primary/30">100+ tools</Badge>
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm mt-1">
                      Puzzles · Memory · Focus · Math · Logic · Goals · Analytics — all in one place.
                    </CardDescription>
                  </div>
                  <ArrowRight className="h-5 w-5 text-primary self-center" />
                </div>
              </CardHeader>
            </Link>
          </Card>
          <IQQuickLauncher />

          <div className="grid md:grid-cols-2 gap-4">
            <div id="iq-daily-section"><IQDailyChallenge /></div>
            <div id="iq-friends-section"><IQFriends /></div>
            <IQFriendCompare />
            <IQNotificationSettings />
            <IQDailyStreak />
          </div>
          <IQGlobalEventFeed />
          <IQBattlePass />
          <IQAICoach />
          <IQReferral />
          <IQPromoCode />
          <IQSubscription />
          <IQPublicProfileSettings />
          <IQLeaguesSection userIQ={stats?.best_iq ?? null} />
          <IQBrainStreaks currentStreak={stats?.current_streak ?? 0} />
          <IQTrainingPlan />
          <IQAchievements />
          <IQCertificate />
          <IQToolsGrid />

          <Card className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/20">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg">How It Works</CardTitle>
              <CardDescription className="text-xs">Your complete guide to the IQ Platform</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                  { icon: Brain, title: "1. Take Tests", desc: "Choose from 4 difficulty levels" },
                  { icon: Zap, title: "2. Use AI Tools", desc: "8+ AI-powered cognitive tools" },
                  { icon: Users, title: "3. Compete", desc: "Duels, tournaments & leagues" },
                  { icon: Trophy, title: "4. Climb Ranks", desc: "Rise through 8 league tiers" },
                ].map((step, i) => (
                  <div key={i} className="text-center space-y-2 p-4 bg-background/50 rounded-lg">
                    <step.icon className="h-10 w-10 text-blue-500 mx-auto" />
                    <h3 className="font-semibold text-sm">{step.title}</h3>
                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-3">Standard difficulty</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testCategories.map((test) => {
                const cd = cooldowns[test.id] ?? 0;
                const locked = cd > 0;
                return (
                  <Card key={test.id} className="hover:shadow-lg transition-shadow border-blue-500/10">
                    <CardHeader className="p-4 sm:p-6">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                            <test.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{test.title}</CardTitle>
                            <CardDescription className="text-xs">{test.description}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">{test.difficulty}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 p-4 sm:p-6">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div><p className="text-muted-foreground text-xs">Questions</p><p className="font-bold">{test.questions}</p></div>
                        <div><p className="text-muted-foreground text-xs">Time</p><p className="font-bold">{test.timeLimit} min</p></div>
                        <div><p className="text-muted-foreground text-xs">Credits</p><p className="font-bold">{test.credits}</p></div>
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                        disabled={locked}
                        onClick={() => handleStartTest(test.id)}
                      >
                        {locked ? `Cooldown · ${formatCooldown(cd)}` : "Start Test"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3">Specialized cognitive tests</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {specializedCategories.map((t) => {
                const cd = cooldowns[t.id] ?? 0;
                const locked = cd > 0;
                return (
                  <Card key={t.id} className="hover:shadow-md transition border-purple-500/15 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                          <t.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{t.title}</p>
                          <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{t.credits} credits</span>
                        <span>20 questions · 15 min</span>
                      </div>
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                        disabled={locked}
                        onClick={() => handleStartTest(t.id)}
                      >
                        {locked ? `Cooldown · ${formatCooldown(cd)}` : "Start"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tools"><IQToolsGrid /></TabsContent>
        <TabsContent value="duels" className="space-y-6">
          <IQLiveSpectatorLobby />
          <IQFriendChallenge />
          <IQDuels />
        </TabsContent>
        <TabsContent value="tournaments" className="space-y-6">
          <IQTournaments />
          <IQHallOfFame />
        </TabsContent>
        <TabsContent value="leaderboard" className="space-y-6">
          <IQGlobalLeaderboard />
          <IQCountryLeaderboard />
        </TabsContent>
        <TabsContent value="progress" className="space-y-6">
          <IQWeeklyRecap />
          <IQMilestones />
          <IQGoals />
          <IQPerformanceInsights />
          <IQProgressCharts />
          <IQShareableCard />
          <IQAchievements />
          <IQCertificate />
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <IQProgressCharts />
          <IQTestHistory />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader><CardTitle>About the IQ Platform</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>The IQ Platform is a comprehensive cognitive assessment and improvement tool. Our scientifically-designed tests measure logical reasoning, pattern recognition, spatial awareness, and problem-solving skills.</p>
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Features:</h4>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li><strong>IQ Tests:</strong> 4 difficulty levels (30-60 questions, 30-75 min). Detailed score breakdowns & percentile rankings.</li>
              <li><strong>8+ AI Tools:</strong> Brain Training, IQ Predictor, Cognitive Report, Study Coach, Certificate Generator & more.</li>
              <li><strong>Live Duels:</strong> Challenge other players in real-time IQ battles across 4 modes.</li>
              <li><strong>Weekly Tournaments:</strong> Compete for prize pools and credit rewards.</li>
              <li><strong>IQ Leagues:</strong> 8-tier ranking system from Bronze to Legend based on your IQ score.</li>
              <li><strong>Brain Streaks:</strong> Daily training streaks with bonus credit rewards.</li>
              <li><strong>Progress Charts:</strong> Visual tracking with line charts, bar charts & radar profiles.</li>
              <li><strong>Achievements:</strong> 12 unlockable badges for cognitive milestones.</li>
              <li><strong>Global Leaderboard:</strong> Worldwide rankings for top performers.</li>
              <li><strong>Daily Challenge:</strong> One free brain question every day.</li>
              <li><strong>IQ Certificate:</strong> AI-generated professional certificate with cognitive breakdown.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {runner && (
        <IQTestRunner
          open={!!runner}
          onClose={() => { setRunner(null); setCooldowns(prev => ({ ...prev, [runner.category]: 24 * 3600 })); }}
          category={runner.category}
          title={runner.title}
          timeLimitMinutes={runner.timeLimit}
        />
      )}
    </div>
    </>
    );
};

export default IQPlatform;
