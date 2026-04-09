import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Trophy, LineChart, Zap, Users, Target, BarChart3, Medal, Gift } from "lucide-react";
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
import IQDailyChallenge from "@/components/iq/IQDailyChallenge";
import IQCertificate from "@/components/iq/IQCertificate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const IQPlatform = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const handleStartTest = async (testType: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: "Please login first", variant: "destructive" }); return; }
      const test = testCategories.find(t => t.id === testType);
      if (!test) return;
      const { data: userCredits } = await supabase.from("brain_duel_credits").select("credits").eq("user_id", session.user.id).maybeSingle();
      if (!userCredits || userCredits.credits < test.credits) {
        toast({ title: "Insufficient Credits", description: `You need ${test.credits} credits.`, variant: "destructive" });
        return;
      }
      await supabase.from("brain_duel_credits").update({ credits: userCredits.credits - test.credits }).eq("user_id", session.user.id);
      toast({ title: "Test Started!", description: `${test.title} - ${test.questions} questions, ${test.timeLimit} min. Good luck!` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const testCategories = [
    { id: "beginner", title: "Beginner IQ Test", description: "Perfect for first-time test takers", difficulty: "Beginner", questions: 30, timeLimit: 30, credits: 10, icon: Target },
    { id: "intermediate", title: "Intermediate IQ Test", description: "Standard IQ assessment", difficulty: "Intermediate", questions: 40, timeLimit: 45, credits: 15, icon: Brain },
    { id: "advanced", title: "Advanced IQ Test", description: "Challenging cognitive assessment", difficulty: "Advanced", questions: 50, timeLimit: 60, credits: 20, icon: Zap },
    { id: "expert", title: "Expert IQ Test", description: "Mensa-level difficulty", difficulty: "Expert", questions: 60, timeLimit: 75, credits: 25, icon: Trophy },
  ];

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-6 mt-16 sm:mt-20">
      <IQPlatformHero totalTests={0} totalUsers={0} userIQ={null} streak={0} />
      <IQCreditsDisplay />

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
          <IQDailyChallenge />
          <IQLeaguesSection userIQ={null} />
          <IQBrainStreaks currentStreak={0} />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testCategories.map((test) => (
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
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600" onClick={() => handleStartTest(test.id)}>Start Test</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tools"><IQToolsGrid /></TabsContent>
        <TabsContent value="duels"><IQDuels /></TabsContent>
        <TabsContent value="tournaments"><IQTournaments /></TabsContent>
        <TabsContent value="leaderboard"><IQGlobalLeaderboard /></TabsContent>
        <TabsContent value="progress">
          <IQProgressCharts />
          <IQAchievements />
          <IQCertificate />
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <IQProgressCharts />
          <Card>
            <CardHeader><CardTitle>Your IQ Journey</CardTitle><CardDescription>Track your progress</CardDescription></CardHeader>
            <CardContent className="text-center py-12">
              <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Take your first IQ test to see your results here</p>
            </CardContent>
          </Card>
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
    </div>
  );
};

export default IQPlatform;
