import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Sparkles, Trophy, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useKidsHomeworkProgress } from "@/hooks/useKidsHomeworkProgress";
import { useKidsDailyChallenge } from "@/hooks/useKidsDailyChallenge";
import { useKidsHomework } from "@/hooks/useKidsHomework";
import { ProgressCard } from "@/components/kids-homework/ProgressCard";
import { AchievementsGrid } from "@/components/kids-homework/AchievementsGrid";
import { DailyChallengeCard } from "@/components/kids-homework/DailyChallengeCard";
import { HomeworkLimitBanner } from "@/components/kids-homework/HomeworkLimitBanner";
import { SubscriptionManagement } from "@/components/kids-homework/SubscriptionManagement";
import { HomeworkHero } from "@/components/kids-homework/HomeworkHero";
import { SubjectSelector } from "@/components/kids-homework/SubjectSelector";
import { QuestionTemplates } from "@/components/kids-homework/QuestionTemplates";
import { ChatResponse } from "@/components/kids-homework/ChatResponse";
import { ComprehensionQuiz } from "@/components/kids-homework/ComprehensionQuiz";
import { SubjectMasteryMap } from "@/components/kids-homework/SubjectMasteryMap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { ParentalGate, useParentalGate } from "@/components/kids/ParentalGate";
import { SafeContentBadge } from "@/components/kids/SafeContentBadge";
import { useNavigate } from "react-router-dom";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
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
  const [lastQuestion, setLastQuestion] = useState("");
  
  const { isVerified, checkVerification } = useParentalGate();
  const [showParentalGate, setShowParentalGate] = useState(false);
  const [isGateChecked, setIsGateChecked] = useState(false);

  useEffect(() => {
    const verified = checkVerification();
    if (!verified) setShowParentalGate(true);
    setIsGateChecked(true);
  }, []);

  const handleParentalGateSuccess = () => setShowParentalGate(false);
  const handleParentalGateCancel = () => {
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
    setLastQuestion(question);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('kids-homework-helper', {
        body: { subject, question, difficulty }
      });

      if (error) {
        if (error.message?.includes('Daily limit reached')) {
          toast.error('Daily limit reached! Upgrade to Premium for unlimited questions.');
          refreshUsage();
          return;
        }
        throw error;
      }
      
      setResult(data);
      refreshUsage();
      
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-6xl mx-auto">
          <HomeworkHero />

          <HeroRewardedAd sectionKey="page_kidshomework" />

          {/* Safe Content Badge */}
          <div className="flex justify-center mb-6">
            <SafeContentBadge variant="compact" />
          </div>

          {/* Usage & Subscription */}
          {!usageLoading && (
            <div className="mb-6 space-y-4">
              <HomeworkLimitBanner questionsUsed={questionsUsed} questionsLimit={questionsLimit} isPremium={isPremium} />
              {isPremium && (
                <SubscriptionManagement subscribed={isPremium} onManageSubscription={manageSubscription} />
              )}
            </div>
          )}

          {/* Progress & Challenge cards */}
          {user && !progressLoading && (
            <div className="mb-6 grid md:grid-cols-2 gap-4">
              <ProgressCard points={points} />
              {!challengeLoading && (
                <DailyChallengeCard challenge={challenge} progress={progress} isCompleted={isCompleted} />
              )}
            </div>
          )}

          <Tabs defaultValue="homework" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 h-auto">
              <TabsTrigger value="homework" className="text-xs sm:text-sm">
                📚 Ask AI
              </TabsTrigger>
              <TabsTrigger value="mastery" className="text-xs sm:text-sm">
                🗺️ Mastery
              </TabsTrigger>
              <TabsTrigger value="achievements" className="text-xs sm:text-sm">
                🏆 Achievements
              </TabsTrigger>
            </TabsList>

            <TabsContent value="homework" className="space-y-6">
              {/* Subject & Difficulty selector */}
              <Card className="border-2 border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Ask Your Question
                  </CardTitle>
                  <CardDescription>
                    Choose a subject, pick difficulty, then type or select a question! 📝
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <SubjectSelector
                    selectedSubject={subject}
                    selectedDifficulty={difficulty}
                    onSubjectChange={setSubject}
                    onDifficultyChange={setDifficulty}
                  />

                  {/* Question templates */}
                  <QuestionTemplates
                    subject={subject}
                    onSelectTemplate={(q) => setQuestion(q)}
                  />

                  {/* Question input */}
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <Textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Type your homework question here... Be as detailed as possible! 📝"
                      className="min-h-[100px] border-2"
                    />
                    <Button
                      type="submit"
                      className="w-full h-11"
                      disabled={loading || (!isPremium && questionsUsed >= questionsLimit) || !subject || !difficulty}
                    >
                      {loading ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                          AI is thinking...
                        </>
                      ) : (!isPremium && questionsUsed >= questionsLimit) ? (
                        '🔒 Daily Limit Reached - Upgrade to Premium'
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Get Help! ✨
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Chat-style response */}
              <ChatResponse
                result={result}
                isLoading={loading}
                question={lastQuestion}
                subject={subject}
              />

              {/* Comprehension quiz after answer */}
              {result && !result.wasFiltered && subject && (
                <ComprehensionQuiz
                  subject={subject}
                  question={lastQuestion}
                  explanation={result.explanation}
                />
              )}
            </TabsContent>

            <TabsContent value="mastery">
              <SubjectMasteryMap points={points} />
            </TabsContent>

            <TabsContent value="achievements">
              {user ? (
                <div className="space-y-6">
                  <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-xl">
                            🏆
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground">Your Achievement Gallery</h3>
                            <p className="text-sm text-muted-foreground">
                              {unlockedAchievements?.length || 0} of {achievements?.length || 0} badges unlocked
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-primary">{points?.total_points || 0}</p>
                          <p className="text-xs text-muted-foreground">Total Points</p>
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
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-amber-400" />
                    <h3 className="text-xl font-bold text-foreground mb-2">Unlock Achievements!</h3>
                    <p className="text-muted-foreground mb-4">
                      Sign in to track your achievements and earn awesome badges! 🏆
                    </p>
                    <Button onClick={() => navigate('/auth')}>
                      Sign In to Start Earning
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Safe Content Badge - Full */}
          <div className="max-w-2xl mx-auto mt-8">
            <SafeContentBadge />
          </div>
        </div>
      </main>

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
