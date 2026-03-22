import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Sparkles, Lightbulb, Trophy, Star, Target, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useKidsHomeworkProgress } from "@/hooks/useKidsHomeworkProgress";
import { useKidsDailyChallenge } from "@/hooks/useKidsDailyChallenge";
import { useKidsHomework } from "@/hooks/useKidsHomework";
import { ProgressCard } from "@/components/kids-homework/ProgressCard";
import { AchievementsGrid } from "@/components/kids-homework/AchievementsGrid";
import { DailyChallengeCard } from "@/components/kids-homework/DailyChallengeCard";
import { HomeworkLimitBanner } from "@/components/kids-homework/HomeworkLimitBanner";
import { SubscriptionManagement } from "@/components/kids-homework/SubscriptionManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { ParentalGate, useParentalGate } from "@/components/kids/ParentalGate";
import { SafeContentBadge } from "@/components/kids/SafeContentBadge";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const KidsHomework = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { points, achievements, unlockedAchievements, isLoading: progressLoading } = useKidsHomeworkProgress();
  const { challenge, progress, isCompleted, isLoading: challengeLoading } = useKidsDailyChallenge();
  const { questionsUsed, questionsLimit, isPremium, loading: usageLoading, refreshUsage, manageSubscription } = useKidsHomework();
  const [subject, setSubject] = useState("");
  const [question, setQuestion] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  // Parental Gate - MANDATORY before accessing
  const { isVerified, checkVerification } = useParentalGate();
  const [showParentalGate, setShowParentalGate] = useState(false);
  const [isGateChecked, setIsGateChecked] = useState(false);

  useEffect(() => {
    // Check parental gate on mount - MANDATORY verification
    const verified = checkVerification();
    if (!verified) {
      setShowParentalGate(true);
    }
    setIsGateChecked(true);
  }, []);

  const handleParentalGateSuccess = () => {
    setShowParentalGate(false);
  };

  const handleParentalGateCancel = () => {
    // Hard redirect to home page - cannot bypass
    setShowParentalGate(false);
    window.location.assign("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim() || !subject || !difficulty) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('kids-homework-helper', {
        body: { subject, question, difficulty }
      });

      if (error) {
        // Check if it's a limit error
        if (error.message?.includes('Daily limit reached')) {
          toast.error('Daily limit reached! Upgrade to Premium for unlimited questions.', {
            duration: 5000,
          });
          refreshUsage();
          return;
        }
        throw error;
      }
      
      setResult(data);
      refreshUsage();
      
      // Invalidate queries to refresh progress and challenges
      if (user) {
        const today = new Date().toISOString().split('T')[0];
        queryClient.invalidateQueries({ queryKey: ['kids-homework-points', user.id] });
        queryClient.invalidateQueries({ queryKey: ['daily-progress', user.id, today] });
        queryClient.invalidateQueries({ queryKey: ['challenge-completion', user.id] });
        toast.success("Homework help ready! You earned 10 points! 🎉");
      } else {
        toast.success("Homework help ready! 🎉");
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Failed to get homework help");
    } finally {
      setLoading(false);
    }
  };

  // Calculate milestone progress
  const totalPoints = points?.total_points || 0;
  const currentMilestone = Math.floor(totalPoints / 100) * 100;
  const nextMilestone = currentMilestone + 100;
  const progressToMilestone = ((totalPoints - currentMilestone) / 100) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-6xl mx-auto">
          {/* Header with Safe Content Badge */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <SafeContentBadge variant="compact" />
            </div>
            <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent flex items-center justify-center gap-3">
              <BookOpen className="w-10 h-10 text-primary" />
              AI Homework Helper
              <Sparkles className="w-8 h-8 text-yellow-500" />
            </h1>
            <p className="text-muted-foreground text-lg">
              Get fun and easy help with your homework! {user && "Earn points and unlock achievements! 🏆"}
            </p>
          </div>

          {/* Milestone Progress Bar - Always visible for logged in users */}
          {user && !progressLoading && (
            <Card className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold text-yellow-700">Progress to Next Milestone</span>
                  </div>
                  <span className="text-sm font-bold text-yellow-600">
                    {totalPoints} / {nextMilestone} points
                  </span>
                </div>
                <Progress value={progressToMilestone} className="h-3 bg-yellow-100" />
                <p className="text-xs text-yellow-600 mt-2 text-center">
                  {nextMilestone - totalPoints} more points to reach your next milestone! 🌟
                </p>
              </CardContent>
            </Card>
          )}

          {/* How It Works Section */}
          <Card className="mb-8 bg-gradient-to-br from-primary/5 to-secondary/10 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Lightbulb className="w-5 h-5 text-primary" />
                How AI Homework Helper Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-6">
              <p className="text-muted-foreground text-sm sm:text-base">
                AI Homework Helper is your friendly study buddy that makes learning fun and easy! 
                Get step-by-step explanations for any homework question across different subjects.
              </p>
              
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary font-bold text-sm shrink-0">1</span>
                  <div>
                    <h4 className="font-semibold text-sm">Choose Your Subject</h4>
                    <p className="text-xs text-muted-foreground">Select from Math, Science, English, History, or Geography</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary font-bold text-sm shrink-0">2</span>
                  <div>
                    <h4 className="font-semibold text-sm">Set Difficulty Level</h4>
                    <p className="text-xs text-muted-foreground">Pick Easy, Medium, or Hard based on your grade level</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary font-bold text-sm shrink-0">3</span>
                  <div>
                    <h4 className="font-semibold text-sm">Ask Your Question</h4>
                    <p className="text-xs text-muted-foreground">Type your homework question in detail for better answers</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary font-bold text-sm shrink-0">4</span>
                  <div>
                    <h4 className="font-semibold text-sm">Get Smart Help</h4>
                    <p className="text-xs text-muted-foreground">Receive clear explanations plus fun facts to boost learning</p>
                  </div>
                </div>
              </div>

              <div className="bg-background/50 p-3 rounded-lg border border-primary/10">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  Earn Points & Achievements!
                </h4>
                <p className="text-xs text-muted-foreground">
                  Sign in to track your progress! Every question earns you <strong>10 points</strong>. Complete daily challenges 
                  to earn bonus points and unlock special achievement badges. Free users get 1 question per day, 
                  or upgrade to Premium for unlimited homework help!
                </p>
              </div>
            </CardContent>
          </Card>

          {!usageLoading && (
            <div className="mb-6 space-y-4">
              <HomeworkLimitBanner
                questionsUsed={questionsUsed}
                questionsLimit={questionsLimit}
                isPremium={isPremium}
              />
              {isPremium && (
                <SubscriptionManagement
                  subscribed={isPremium}
                  onManageSubscription={manageSubscription}
                />
              )}
            </div>
          )}

          {user && !progressLoading && (
            <div className="mb-8 grid md:grid-cols-2 gap-4">
              <ProgressCard points={points} />
              {!challengeLoading && (
                <DailyChallengeCard 
                  challenge={challenge} 
                  progress={progress}
                  isCompleted={isCompleted}
                />
              )}
            </div>
          )}

          <Tabs defaultValue="homework" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="homework" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Homework
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Achievements
              </TabsTrigger>
            </TabsList>

            <TabsContent value="homework" className="space-y-6">
              <Card className="mb-6 border-2 border-primary/20">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Ask Your Question
                  </CardTitle>
                  <CardDescription>
                    Tell me about your homework and I'll help you understand it better! 📚
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        Subject
                      </label>
                      <Select value={subject} onValueChange={setSubject}>
                        <SelectTrigger className="border-2">
                          <SelectValue placeholder="Choose your subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="math">📐 Math</SelectItem>
                          <SelectItem value="science">🔬 Science</SelectItem>
                          <SelectItem value="english">📖 English</SelectItem>
                          <SelectItem value="history">🏛️ History</SelectItem>
                          <SelectItem value="geography">🌍 Geography</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-500" />
                        Difficulty
                      </label>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger className="border-2">
                          <SelectValue placeholder="How hard is it?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">😊 Easy (Grades 1-2)</SelectItem>
                          <SelectItem value="medium">🤔 Medium (Grades 3-4)</SelectItem>
                          <SelectItem value="hard">🧠 Hard (Grades 5-6)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Your Question</label>
                      <Textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Type your homework question here... Be as detailed as possible for the best answer! 📝"
                        className="min-h-[120px] border-2"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" 
                      disabled={loading || (!isPremium && questionsUsed >= questionsLimit)}
                    >
                      {loading ? (
                        <>
                          <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                          AI is thinking...
                        </>
                      ) : (!isPremium && questionsUsed >= questionsLimit) ? (
                        '🔒 Daily Limit Reached - Upgrade to Premium'
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Get Help! ✨
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {result && (
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      Your Answer 🎉
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-white/80 p-4 rounded-lg border border-green-100">
                      <h3 className="font-semibold mb-2 text-green-700">📝 Explanation:</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{result.explanation}</p>
                    </div>

                    {result.funFacts && result.funFacts.length > 0 && (
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h3 className="font-semibold mb-3 flex items-center gap-2 text-yellow-700">
                          <Sparkles className="w-4 h-4 text-yellow-500" />
                          Fun Facts! 🌟
                        </h3>
                        <ul className="space-y-2">
                          {result.funFacts.map((fact: string, index: number) => (
                            <li key={index} className="text-sm bg-white/50 p-2 rounded-lg border border-yellow-100">
                              {fact}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.wasFiltered && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-center">
                        <p className="text-sm text-blue-600">
                          💡 Tip: Try asking about school subjects like Math, Science, English, History, or Geography!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="achievements">
              {user ? (
                <div className="space-y-6">
                  <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-purple-700">Your Achievement Gallery</h3>
                            <p className="text-sm text-purple-600">
                              {unlockedAchievements?.length || 0} of {achievements?.length || 0} badges unlocked
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-purple-700">{totalPoints}</p>
                          <p className="text-xs text-purple-600">Total Points</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <AchievementsGrid 
                    achievements={achievements || []} 
                    unlockedAchievements={unlockedAchievements || []} 
                  />
                </div>
              ) : (
                <Card className="border-2 border-dashed border-primary/30">
                  <CardContent className="py-12 text-center">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                    <h3 className="text-xl font-bold mb-2">Unlock Achievements!</h3>
                    <p className="text-muted-foreground mb-4">
                      Sign in to track your achievements and earn awesome badges! 🏆
                    </p>
                    <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-purple-500 to-pink-500">
                      Sign In to Start Earning
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Safe Content Badge - Full version at bottom */}
        <div className="max-w-2xl mx-auto mt-8">
          <SafeContentBadge />
        </div>
      </main>
      <Footer />
      
      {/* HARDENED Parental Gate Dialog - Cannot be bypassed */}
      <ParentalGate
        isOpen={showParentalGate}
        onSuccess={handleParentalGateSuccess}
        onCancel={handleParentalGateCancel}
        featureName="AI Homework Helper"
      />
    </div>
  );
};

export default KidsHomework;
