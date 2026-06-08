import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Sparkles, Trophy, Send, Camera, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useKidsHomeworkProgress } from "@/hooks/useKidsHomeworkProgress";
import { useKidsDailyChallenge } from "@/hooks/useKidsDailyChallenge";
import { useHomeworkCredits, HOMEWORK_CREDITS_PER_QUESTION } from "@/hooks/useHomeworkCredits";
import { ProgressCard } from "@/components/kids-homework/ProgressCard";
import { AchievementsGrid } from "@/components/kids-homework/AchievementsGrid";
import { DailyChallengeCard } from "@/components/kids-homework/DailyChallengeCard";
import { HomeworkLimitBanner } from "@/components/kids-homework/HomeworkLimitBanner";
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
import { useNavigate, useSearchParams } from "react-router-dom";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";

const KidsHomework = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { points, achievements, unlockedAchievements, isLoading: progressLoading } = useKidsHomeworkProgress();
  const { challenge, progress, isCompleted, isLoading: challengeLoading } = useKidsDailyChallenge();
  const {
    credits_remaining,
    canAsk,
    loading: usageLoading,
    refresh: refreshCredits,
    purchaseCredits,
  } = useHomeworkCredits();

  const [subject, setSubject] = useState<string>(() => {
    try { return localStorage.getItem("kids_homework_subject") || ""; } catch { return ""; }
  });
  const [question, setQuestion] = useState("");
  const [difficulty, setDifficulty] = useState<string>(() => {
    try { return localStorage.getItem("kids_homework_difficulty") || ""; } catch { return ""; }
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [lastQuestion, setLastQuestion] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    try { if (subject) localStorage.setItem("kids_homework_subject", subject); } catch {}
  }, [subject]);
  useEffect(() => {
    try { if (difficulty) localStorage.setItem("kids_homework_difficulty", difficulty); } catch {}
  }, [difficulty]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) { toast.error("Photo must be under 8MB"); return; }
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(f);
  };

  const { isVerified, checkVerification } = useParentalGate();
  const [showParentalGate, setShowParentalGate] = useState(false);
  const [, setIsGateChecked] = useState(false);

  useEffect(() => {
    const verified = checkVerification();
    if (!verified) setShowParentalGate(true);
    setIsGateChecked(true);
  }, []);

  // Refresh credits after returning from Stripe success
  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      toast.success("Payment successful! Credits added to your account.");
      refreshCredits();
    } else if (searchParams.get("payment") === "canceled") {
      toast.info("Payment canceled.");
    }
  }, [searchParams, refreshCredits]);

  const handleParentalGateSuccess = () => setShowParentalGate(false);
  const handleParentalGateCancel = () => {
    setShowParentalGate(false);
    window.location.assign("/");
  };

  const handleBuyCredits = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    navigate("/kids-homework-pricing");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!question.trim() && !photo) || !subject || !difficulty) {
      toast.error("Pick subject, difficulty, and add a question or photo");
      return;
    }
    if (!user) {
      toast.error("Please sign in to ask questions");
      navigate("/auth");
      return;
    }
    if (!canAsk) {
      toast.error(`You need ${HOMEWORK_CREDITS_PER_QUESTION} Homework credits.`);
      return;
    }

    setLoading(true);
    setLastQuestion(question || "📷 Photo problem");
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("kids-homework-helper", {
        body: { subject, question, difficulty, imageBase64: photo },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data);
      setPhoto(null);
      refreshCredits();

      const today = new Date().toISOString().split("T")[0];
      queryClient.invalidateQueries({ queryKey: ["kids-homework-points", user.id] });
      queryClient.invalidateQueries({ queryKey: ["daily-progress", user.id, today] });
      queryClient.invalidateQueries({ queryKey: ["challenge-completion", user.id] });
      toast.success(`Homework help ready! ${HOMEWORK_CREDITS_PER_QUESTION} credits used.`);
    } catch (error: any) {
      console.error("Error:", error);
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

          {/* Credit balance */}
          {!usageLoading && (
            <div className="mb-6">
              <HomeworkLimitBanner
                creditsRemaining={credits_remaining}
                creditsPerQuestion={HOMEWORK_CREDITS_PER_QUESTION}
                onBuyCredits={handleBuyCredits}
              />
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

          {/* Sign-in teaser for anonymous visitors */}
          {!user && (
            <Card className="mb-6 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="p-5 flex flex-col sm:flex-row items-center gap-4">
                <div className="text-4xl" aria-hidden>🏆</div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-semibold text-base">Sign in to track your progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Earn XP, unlock badges, complete daily challenges and keep your streak.
                  </p>
                </div>
                <Button onClick={() => navigate(`/auth?redirect=${encodeURIComponent("/kids-homework")}`)}>
                  Sign in
                </Button>
              </CardContent>
            </Card>
          )}


          <Tabs defaultValue="homework" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 h-auto">
              <TabsTrigger value="homework" className="text-xs sm:text-sm">📚 Ask AI</TabsTrigger>
              <TabsTrigger value="mastery" className="text-xs sm:text-sm">🗺️ Mastery</TabsTrigger>
              <TabsTrigger value="achievements" className="text-xs sm:text-sm">🏆 Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="homework" className="space-y-6">
              <Card className="border-2 border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Ask Your Question
                  </CardTitle>
                  <CardDescription>
                    Choose a subject, pick difficulty, then type or select a question. Each question costs {HOMEWORK_CREDITS_PER_QUESTION} credits.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <SubjectSelector
                    selectedSubject={subject}
                    selectedDifficulty={difficulty}
                    onSubjectChange={setSubject}
                    onDifficultyChange={setDifficulty}
                  />

                  <QuestionTemplates subject={subject} onSelectTemplate={(q) => setQuestion(q)} />

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <Textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Type your homework question, or snap a photo below 📝"
                      className="min-h-[100px] border-2"
                    />

                    {/* Photo upload */}
                    <div className="flex items-center gap-2">
                      <label className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handlePhotoSelect}
                          className="hidden"
                        />
                        <div className="flex items-center justify-center gap-2 h-11 rounded-md border-2 border-dashed border-primary/40 bg-primary/5 text-sm cursor-pointer hover:bg-primary/10 transition">
                          <Camera className="w-4 h-4 text-primary" />
                          <span className="font-medium">{photo ? "Replace photo" : "📷 Snap a photo of the problem"}</span>
                        </div>
                      </label>
                      {photo && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => setPhoto(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {photo && (
                      <div className="rounded-lg overflow-hidden border-2 border-primary/20">
                        <img src={photo} alt="Homework preview" className="w-full max-h-64 object-contain bg-muted" />
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-11"
                      disabled={loading || !canAsk || !subject || !difficulty || (!question.trim() && !photo)}
                    >
                      {loading ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                          AI is thinking...
                        </>
                      ) : !canAsk ? (
                        `🔒 Need ${HOMEWORK_CREDITS_PER_QUESTION} credits — buy more`
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Get Help! ✨ ({HOMEWORK_CREDITS_PER_QUESTION} credits)
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <ChatResponse result={result} isLoading={loading} question={lastQuestion} subject={subject} />

              {result && !result.wasFiltered && subject && (
                <ComprehensionQuiz subject={subject} question={lastQuestion} explanation={result.explanation} />
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
                    <Button onClick={() => navigate("/auth")}>Sign In to Start Earning</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

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
