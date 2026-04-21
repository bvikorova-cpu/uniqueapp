import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { useScienceSubscription } from "@/hooks/useScienceSubscription";
import { ScienceLimitBanner } from "@/components/kids-science/ScienceLimitBanner";
import { ScienceSubscriptionManagement } from "@/components/kids-science/ScienceSubscriptionManagement";
import { useNavigate } from "react-router-dom";
import { ParentalGate } from "@/components/kids/ParentalGate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// New components
import { ScienceLabHero } from "@/components/kids-science/ScienceLabHero";
import { ExperimentWizard } from "@/components/kids-science/ExperimentWizard";
import { ExperimentTemplates } from "@/components/kids-science/ExperimentTemplates";
import { LabNotebookResult } from "@/components/kids-science/LabNotebookResult";
import { ScienceComprehensionQuiz } from "@/components/kids-science/ScienceComprehensionQuiz";
import { ExperimentTracker } from "@/components/kids-science/ExperimentTracker";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
const PARENTAL_GATE_KEY = "parental_gate_verified_kids_science_lab";

const KidsScienceLab = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [observations, setObservations] = useState("");
  const [difficulty, setDifficulty] = useState("explorer");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const { subscription, refreshSubscription, subscribe, manageSubscription, incrementUsage } = useScienceSubscription();

  // Parental gate state
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
    if (isVerified) refreshSubscription();
  }, [isVerified]);

  const handleVerificationSuccess = () => setIsVerified(true);

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
    if (!subscription.subscribed && subscription.experiments_used >= subscription.experiments_limit) {
      toast.error("Monthly limit reached! Upgrade to Premium.");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in to analyze experiments"); return; }

      const { data, error } = await supabase.functions.invoke('kids-science-lab', {
        body: { category, hypothesis, observations, difficulty }
      });
      if (error) throw error;

      setResult(data);
      setShowQuiz(true);
      await incrementUsage();
      toast.success("AI analyzed your experiment! 🔬");
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Failed to analyze experiment");
    } finally {
      setLoading(false);
    }
  };

  const canAnalyze = subscription.subscribed || subscription.experiments_used < subscription.experiments_limit;

  if (!isVerified) {
    return (
      <div className="min-h-screen">
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

          {/* Subscription Banner */}
          {subscription.loading ? (
            <div className="animate-pulse text-center py-4 text-muted-foreground">
              Loading subscription status...
            </div>
          ) : (
            <ScienceLimitBanner
              experimentsUsed={subscription.experiments_used}
              experimentsLimit={subscription.experiments_limit}
              isPremium={subscription.subscribed}
              onUpgrade={() => navigate('/kids-science-pricing')}
            />
          )}

          {subscription.subscribed && (
            <ScienceSubscriptionManagement
              subscribed={subscription.subscribed}
              onManageSubscription={manageSubscription}
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
                canAnalyze={canAnalyze}
              />

              {/* Results */}
              {result && (
                <LabNotebookResult result={result} category={category} />
              )}

              {/* Comprehension Quiz */}
              {showQuiz && result && (
                <ScienceComprehensionQuiz
                  category={category}
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
              <ExperimentTracker experimentsCompleted={subscription.experiments_used} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default KidsScienceLab;