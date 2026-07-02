import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { useScienceCredits, SCIENCE_CREDITS_PER_RUN } from "@/hooks/useScienceCredits";
import { ScienceLimitBanner } from "@/components/kids-science/ScienceLimitBanner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ParentalGate, useParentalGate } from "@/components/kids/ParentalGate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ScienceLabHero } from "@/components/kids-science/ScienceLabHero";
import { ExperimentWizard } from "@/components/kids-science/ExperimentWizard";
import { ExperimentTemplates } from "@/components/kids-science/ExperimentTemplates";
import { LabNotebookResult } from "@/components/kids-science/LabNotebookResult";
import { ScienceComprehensionQuiz } from "@/components/kids-science/ScienceComprehensionQuiz";
import { ExperimentTracker } from "@/components/kids-science/ExperimentTracker";
import { SafetyCheckCard } from "@/components/kids-science/SafetyCheckCard";
import { AskTheScientist } from "@/components/kids-science/AskTheScientist";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_KIDSSCIENCELAB_STEPS = [
  { title: 'Pick an experiment', desc: 'Browse by topic and age — each has a safety label.' },
  { title: 'Watch the demo', desc: 'Short videos and animations explain the science.' },
  { title: 'Try it at home', desc: 'Follow the step-by-step guide with safe materials.' },
  { title: 'Answer the quiz', desc: 'A short quiz cements the science and rewards stars.' }
];
const __HIW_KIDSSCIENCELAB = { title: 'Kids Science Lab', intro: 'Interactive, safe science experiments for kids.', steps: __HIW_KIDSSCIENCELAB_STEPS };


const PARENTAL_GATE_KEY = "parental_gate_verified_kids_science_lab";

const KidsScienceLab = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [observations, setObservations] = useState("");
  const [difficulty, setDifficulty] = useState("explorer");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    conclusion: string;
    explanation: string;
    funFacts: string[];
    quiz: { question: string; options: string[]; correctIndex: number }[];
  } | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [analysesCompleted, setAnalysesCompleted] = useState(0);
  const credits = useScienceCredits();

  // Parental gate (shared hook)
  const { isVerified, checkVerification } = useParentalGate(PARENTAL_GATE_KEY);

  // Handle Stripe redirect: ?payment=success&session_id=…
  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    if (payment === "success" && sessionId) {
      (async () => {
        try {
          const { data, error } = await supabase.functions.invoke("verify-credits-payment", {
            body: { session_id: sessionId },
          });
          if (error) throw error;
          if (data?.success) {
            toast.success(`Added ${data.credits_added ?? ""} Science credits! 🔬`);
            credits.refresh();
          }
        } catch (e) {
          console.error("verify-credits-payment", e);
        } finally {
          searchParams.delete("payment");
          searchParams.delete("session_id");
          setSearchParams(searchParams, { replace: true });
        }
      })();
    } else if (payment === "canceled") {
      toast.info("Checkout canceled.");
      searchParams.delete("payment");
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleVerificationSuccess = () => checkVerification();

  const handleTemplateSelect = (template: { category: string; hypothesis: string; observations: string }) => {
    setCategory(template.category);
    setHypothesis(template.hypothesis);
    setObservations(template.observations);
    toast.success("Template loaded! Go to the Experiment tab.");
  };

  const handleAnalyze = async () => {
    if (!category || !hypothesis.trim() || !observations.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!credits.canRun) {
      toast.error(
        `Need ${SCIENCE_CREDITS_PER_RUN} Science credits to run an analysis. Tap "Buy credits" below.`,
      );
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to analyze experiments");
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke("kids-science-lab", {
        body: { category, hypothesis, observations, difficulty },
      });

      if (error) throw error;
      if (!data || data.error) throw new Error(data?.error || "AI analysis failed");

      setResult({
        conclusion: String(data.conclusion ?? ""),
        explanation: String(data.explanation ?? ""),
        funFacts: Array.isArray(data.funFacts) ? data.funFacts.map(String) : [],
        quiz: Array.isArray(data.quiz)
          ? data.quiz.map((q: any) => ({
              question: String(q?.question ?? ""),
              options: Array.isArray(q?.options) ? q.options.map(String).slice(0, 3) : [],
              correctIndex: Math.max(0, Math.min(2, Number(q?.correctIndex ?? 0))),
            }))
          : [],
      });
      setShowQuiz(true);
      setAnalysesCompleted((n) => n + 1);
      await credits.refresh();
      toast.success("AI analyzed your experiment! 🔬");
    } catch (error: any) {
      console.error("Error:", error);
      const msg = error?.message || "Failed to analyze experiment";
      if (msg.toLowerCase().includes("credit")) {
        toast.error(msg);
      } else if (msg.includes("429") || msg.toLowerCase().includes("rate limit")) {
        toast.error("Too many requests. Please wait a moment.");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isVerified) {
    return (
      <div className="min-h-screen">
      <FloatingHowItWorks title={__HIW_KIDSSCIENCELAB.title} intro={__HIW_KIDSSCIENCELAB.intro} steps={__HIW_KIDSSCIENCELAB.steps} />
        <ParentalGate
          isOpen={true}
          storageKey={PARENTAL_GATE_KEY}
          onSuccess={handleVerificationSuccess}
          onCancel={() => navigate("/")}
          featureName="AI Science Lab"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto space-y-6">
          <ScienceLabHero />

          <HeroRewardedAd sectionKey="page_kidssciencelab" />

          {/* Safety Warning */}
          <Alert className="border-2 border-orange-500 bg-gradient-to-r from-orange-500/20 to-red-500/20 shadow-lg">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            <AlertDescription className="ml-2 text-base font-semibold text-orange-800 dark:text-orange-200">
              ⚠️ SAFETY: Always do experiments with an adult! Use protective goggles and gloves.
            </AlertDescription>
          </Alert>

          {/* Credit Banner */}
          {credits.loading ? (
            <div className="animate-pulse text-center py-4 text-muted-foreground">
              Loading Science credits…
            </div>
          ) : (
            <ScienceLimitBanner
              creditsRemaining={credits.credits_remaining}
              creditsPerRun={SCIENCE_CREDITS_PER_RUN}
              onBuyCredits={() => navigate("/kids-science-pricing")}
            />
          )}

          {/* Main Tabs */}
          <Tabs defaultValue="experiment" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="experiment">🔬 Experiment</TabsTrigger>
              <TabsTrigger value="templates">⚡ Templates</TabsTrigger>
              <TabsTrigger value="tracker">🏅 Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="experiment" className="space-y-6">
              <ExperimentWizard
                category={category}
                setCategory={setCategory}
                hypothesis={hypothesis}
                setHypothesis={setHypothesis}
                observations={observations}
                setObservations={setObservations}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                onAnalyze={handleAnalyze}
                loading={loading}
                canAnalyze={credits.canRun}
              />

              {/* AI Safety Check (credit-gated) */}
              {category && hypothesis.trim() && observations.trim() && !result && (
                <SafetyCheckCard
                  category={category}
                  hypothesis={hypothesis}
                  observations={observations}
                  onCreditsChanged={() => credits.refresh()}
                />
              )}

              {result && <LabNotebookResult result={result} category={category} />}

              {result && (
                <div className="flex justify-center">
                  <Button
                    onClick={() => {
                      setResult(null);
                      setShowQuiz(false);
                      setHypothesis("");
                      setObservations("");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    variant="outline"
                    size="lg"
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" /> Try another experiment
                  </Button>
                </div>
              )}

              {result && (
                <AskTheScientist
                  context={`Category: ${category}. Hypothesis: ${hypothesis}. Observations: ${observations}. Conclusion: ${result.conclusion}`}
                  onCreditsChanged={() => credits.refresh()}
                />
              )}

              {showQuiz && result && result.quiz.length >= 3 && (
                <ScienceComprehensionQuiz
                  category={category}
                  difficulty={difficulty}
                  questions={result.quiz}
                  onComplete={(xp) => {
                    toast.success(`You earned +${xp} XP from the quiz! 🧠`);
                    setShowQuiz(false);
                  }}
                />
              )}
            </TabsContent>

            <TabsContent value="templates">
              <ExperimentTemplates onSelect={handleTemplateSelect} />
            </TabsContent>

            <TabsContent value="tracker">
              <ExperimentTracker experimentsCompleted={analysesCompleted} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default KidsScienceLab;
