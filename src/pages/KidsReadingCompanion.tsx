import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { useKidsReadingCredits, KIDS_READING_CREDIT_COST } from "@/hooks/useKidsReadingCredits";
import { CreditBanner } from "@/components/kids/CreditBanner";
import { ParentalGate } from "@/components/kids/ParentalGate";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReadingHero } from "@/components/kids-reading/ReadingHero";
import { ReadingLevelSelector } from "@/components/kids-reading/ReadingLevelSelector";
import { ReadingStreakDashboard } from "@/components/kids-reading/ReadingStreakDashboard";
import { TextDifficultyScanner } from "@/components/kids-reading/TextDifficultyScanner";
import { InteractiveResults } from "@/components/kids-reading/InteractiveResults";
import { VocabularyFlashcardGame } from "@/components/kids-reading/VocabularyFlashcardGame";
import { MultiQuestionQuiz } from "@/components/kids-reading/MultiQuestionQuiz";
import { ReadAloudPlayer } from "@/components/kids-reading/ReadAloudPlayer";
import { WordDefinitionPopover } from "@/components/kids-reading/WordDefinitionPopover";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
const PARENTAL_GATE_KEY = "parental_gate_verified_kids_reading_companion";

const KidsReadingCompanion = () => {
  const navigate = useNavigate();
  const [bookText, setBookText] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [readingLevel, setReadingLevel] = useState("intermediate");
  const [activeView, setActiveView] = useState<"input" | "results" | "flashcards" | "quiz">("input");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [defineWord, setDefineWord] = useState<string | null>(null);
  const { balance, canUse, isLoading: creditsLoading, purchase, refresh: refreshCredits, costPerUse } = useKidsReadingCredits();

  const handleBuyCredits = async () => {
    const url = await purchase(50);
    if (url) { const __w = window.open(url, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = url; }
  };

  // Stats (persisted in localStorage per user)
  const statsKey = `kids-reading-stats:${user?.id || "guest"}`;
  const [stats, setStats] = useState(() => {
    try {
      const raw = localStorage.getItem(statsKey);
      if (raw) return JSON.parse(raw);
    } catch {}
    return { textsAnalyzed: 0, wordsLearned: 0, quizzesTaken: 0, currentStreak: 0 };
  });
  useEffect(() => {
    try { localStorage.setItem(statsKey, JSON.stringify(stats)); } catch {}
  }, [stats, statsKey]);

  // Parental gate
  const [isVerified, setIsVerified] = useState<boolean>(() => {
    const stored = sessionStorage.getItem(PARENTAL_GATE_KEY);
    if (!stored) return false;
    try {
      const { expiresAt } = JSON.parse(stored);
      if (Date.now() < expiresAt) return true;
      sessionStorage.removeItem(PARENTAL_GATE_KEY);
      return false;
    } catch {
      sessionStorage.removeItem(PARENTAL_GATE_KEY);
      return false;
    }
  });

  useEffect(() => {
    const tick = () => {
      const stored = sessionStorage.getItem(PARENTAL_GATE_KEY);
      if (!stored) { if (isVerified) setIsVerified(false); return; }
      try {
        const { expiresAt } = JSON.parse(stored);
        if (Date.now() >= expiresAt) {
          sessionStorage.removeItem(PARENTAL_GATE_KEY);
          if (isVerified) setIsVerified(false);
        }
      } catch {
        sessionStorage.removeItem(PARENTAL_GATE_KEY);
        if (isVerified) setIsVerified(false);
      }
    };
    const interval = setInterval(tick, 30_000);
    return () => clearInterval(interval);
  }, [isVerified]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session);
    });
    return () => { authSub.unsubscribe(); };
  }, []);

  const analyzeText = async () => {
    if (!bookText.trim()) { toast.error("Please paste some text to analyze"); return; }
    if (!isAuthenticated) { toast.error("Please sign in to use this feature"); return; }
    if (!canUse) {
      toast.error(`You need ${costPerUse} Reading credits. Buy more to continue!`);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('kids-reading-companion', {
        body: { text: bookText, action: 'analyze', level: readingLevel }
      });
      if (error) throw error;
      setAnalysis(data);
      setActiveView("results");
      refreshCredits();
      setStats(prev => ({
        ...prev,
        textsAnalyzed: prev.textsAnalyzed + 1,
        wordsLearned: prev.wordsLearned + (data.vocabulary?.length || 0),
      }));
      toast.success("Text analyzed! 📖");
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Failed to analyze text");
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async () => {
    if (!isAuthenticated) { toast.error("Please sign in to use this feature"); return; }
    if (!canUse) {
      toast.error(`You need ${costPerUse} Reading credits. Buy more to continue!`);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('kids-reading-companion', {
        body: { text: bookText, action: 'multi-quiz', level: readingLevel }
      });
      if (error) throw error;
      setQuiz(data);
      setActiveView("quiz");
      refreshCredits();
      toast.success("Quiz ready! 🎯");
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  if (!isVerified) {
    return (
      <div className="min-h-screen">
        <ParentalGate
          isOpen={true}
          storageKey={PARENTAL_GATE_KEY}
          onSuccess={() => setIsVerified(true)}
          onCancel={() => navigate("/")}
          featureName="AI Reading Companion"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <ReadingHero />

          <HeroRewardedAd sectionKey="page_kidsreadingcompanion" />

          <ReadingStreakDashboard {...stats} />

          {/* Credit balance */}
          {!creditsLoading && isAuthenticated && (
            <div className="mb-6">
              <CreditBanner
                label="Reading"
                creditsRemaining={balance}
                costPerUse={costPerUse}
                onBuyCredits={handleBuyCredits}
                unitName="analysis"
              />
            </div>
          )}
          {!isAuthenticated && (
            <Card className="mb-6 border border-border/50">
              <CardContent className="py-4 text-center text-sm text-muted-foreground">
                Sign in to start reading
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="read" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="read">📖 Read</TabsTrigger>
              <TabsTrigger value="flashcards" disabled={!analysis?.vocabulary?.length}>🃏 Flashcards</TabsTrigger>
              <TabsTrigger value="howto">❓ How To</TabsTrigger>
            </TabsList>

            <TabsContent value="read">
              {activeView === "input" && (
                <div className="space-y-4">
                  <ReadingLevelSelector selected={readingLevel} onSelect={setReadingLevel} />

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <BookOpen className="w-5 h-5 text-primary" />
                        Paste Your Text
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Copy any text from a book, article, or homework assignment
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        value={bookText}
                        onChange={(e) => setBookText(e.target.value)}
                        placeholder="Paste your text here... (a paragraph from your book, a story, or any text you want to understand better)"
                        className="min-h-[160px] text-sm"
                      />

                      <TextDifficultyScanner text={bookText} />

                      {bookText.trim().length > 20 && (
                        <ReadAloudPlayer
                          text={bookText}
                          onWordClick={(w) => setDefineWord(w)}
                        />
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={analyzeText}
                          disabled={loading || !bookText.trim() || !canUse}
                          className="text-sm"
                        >
                          {loading ? "Analyzing..." : !canUse ? (
                            <><Lock className="w-3 h-3 mr-1" />Buy credits</>
                          ) : `📝 Analyze (${KIDS_READING_CREDIT_COST})`}
                        </Button>
                        <Button
                          onClick={generateQuiz}
                          disabled={loading || !bookText.trim() || !canUse}
                          variant="outline"
                          className="text-sm"
                        >
                          {!canUse ? (
                            <><Lock className="w-3 h-3 mr-1" />Buy credits</>
                          ) : `🎯 Quiz (${KIDS_READING_CREDIT_COST})`}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeView === "results" && analysis && (
                <div className="space-y-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveView("input")}
                    className="text-xs"
                  >
                    ← Back to Text
                  </Button>
                  <InteractiveResults
                    summary={analysis.summary}
                    vocabulary={analysis.vocabulary || []}
                    onStartFlashcards={() => setActiveView("flashcards")}
                    onStartQuiz={generateQuiz}
                  />
                </div>
              )}

              {activeView === "flashcards" && analysis?.vocabulary?.length > 0 && (
                <div className="space-y-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveView("results")}
                    className="text-xs"
                  >
                    ← Back to Results
                  </Button>
                  <VocabularyFlashcardGame
                    vocabulary={analysis.vocabulary}
                    onComplete={(score) => {
                      toast.success(`Flashcards complete! Score: ${score}`);
                      setActiveView("results");
                    }}
                  />
                </div>
              )}

              {activeView === "quiz" && quiz && (
                <div className="space-y-4">
                  <MultiQuestionQuiz
                    questions={Array.isArray(quiz) ? quiz : quiz.questions || [quiz]}
                    onComplete={(score, total) => {
                      setStats(prev => ({ ...prev, quizzesTaken: prev.quizzesTaken + 1 }));
                      toast.success(`Quiz complete! ${score}/${total}`);
                    }}
                    onBack={() => setActiveView("input")}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="flashcards">
              {analysis?.vocabulary?.length > 0 ? (
                <VocabularyFlashcardGame
                  vocabulary={analysis.vocabulary}
                  onComplete={(score) => {
                    toast.success(`Great job! Score: ${score}`);
                  }}
                />
              ) : (
                <Card className="border-dashed border-2">
                  <CardContent className="py-12 text-center space-y-3">
                    <div className="text-4xl">🃏</div>
                    <h3 className="font-bold">No Flashcards Yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Analyze a text first to generate vocabulary flashcards!
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="howto">
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    ❓ How to Use This Tool
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { step: 1, title: "Choose Your Level", desc: "Select your reading level — Beginner, Intermediate, or Advanced — so the AI adapts explanations to you." },
                    { step: 2, title: "Paste Your Text", desc: "Copy any text from your book, article, or homework. The difficulty scanner will show you stats instantly." },
                    { step: 3, title: "Analyze & Learn", desc: "Click 'Analyze Text' to get a simple summary and new vocabulary words explained in a kid-friendly way." },
                    { step: 4, title: "Practice & Quiz", desc: "Use flashcards to memorize new words, then take the quiz to test your understanding. Track your streak!" },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-0.5">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}

                  <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">💡 Pro Tip:</span> The longer your text, the better the AI can help. Try pasting a full paragraph for best results!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <WordDefinitionPopover
        word={defineWord}
        context={bookText.slice(0, 800)}
        level={readingLevel}
        onClose={() => setDefineWord(null)}
        onCreditsUsed={refreshCredits}
      />
    </div>
  );
};

export default KidsReadingCompanion;
