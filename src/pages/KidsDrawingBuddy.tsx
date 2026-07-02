import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, ChevronLeft, Sparkles, Coins, Paintbrush, Palette, Zap, Trophy, Wand2 } from "lucide-react";
import { SketchEnhancer } from "@/components/kids-drawing/SketchEnhancer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { DrawingCanvas } from "@/components/kids-drawing/DrawingCanvas";
import { DrawingGallery } from "@/components/kids-drawing/DrawingGallery";
import { DrawingBuddyHero } from "@/components/kids-drawing/DrawingBuddyHero";
import { DrawingCategorySelector } from "@/components/kids-drawing/DrawingCategorySelector";
import { DrawingDifficultySelector } from "@/components/kids-drawing/DrawingDifficultySelector";
import { DrawingWizardStepper } from "@/components/kids-drawing/DrawingWizardStepper";
import { QuickDrawTemplates } from "@/components/kids-drawing/QuickDrawTemplates";
import { DrawingAchievements } from "@/components/kids-drawing/DrawingAchievements";
import { useKidsDrawingCredits, KIDS_DRAWING_CREDIT_COST } from "@/hooks/useKidsDrawingCredits";
import { useKidsDrawingCount } from "@/hooks/useKidsDrawingCount";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ParentalGate, useParentalGate } from "@/components/kids/ParentalGate";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_KIDSDRAWINGBUDDY_STEPS = [
  { title: 'Draw anything', desc: 'Free-draw on the safe kids canvas.' },
  { title: 'AI transforms it', desc: 'The buddy turns the doodle into a colorful artwork.' },
  { title: 'Save and print', desc: 'Download to print or share via safe kids share view.' },
  { title: 'Uses credits', desc: 'Each AI transformation costs a few credits.' }
];
const __HIW_KIDSDRAWINGBUDDY = { title: 'Kids Drawing Buddy', intro: 'An AI drawing companion — turns doodles into art.', steps: __HIW_KIDSDRAWINGBUDDY_STEPS };

const PARENTAL_GATE_KEY = "parental_gate_verified_kids_drawing_buddy";
const WIZARD_STEPS = ["Category", "Topic", "Difficulty", "Draw!"];

const KidsDrawingBuddy = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(false);
  const [tutorial, setTutorial] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardStep, setWizardStep] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("tutorial");

  const { balance, canUse, refresh, costPerUse } = useKidsDrawingCredits();
  const { count: drawingsCount } = useKidsDrawingCount();

  // Parental gate (shared hook)
  const { isVerified, checkVerification } = useParentalGate(PARENTAL_GATE_KEY);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(() => { checkAuth(); });
    return () => authSub.unsubscribe();
  }, []);

  // Verify Stripe payment on return
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const paymentStatus = searchParams.get("payment");
    if (sessionId && paymentStatus === "success") {
      (async () => {
        try {
          const { data, error } = await supabase.functions.invoke("verify-credits-payment", {
            body: { session_id: sessionId },
          });
          if (error) throw error;
          if (data?.success) {
            toast.success(`${data.credits_added} credits added! 🎨`);
            refresh();
          }
        } catch (e: any) {
          toast.error("Failed to verify payment");
        } finally {
          setSearchParams({});
        }
      })();
    }
  }, [searchParams, setSearchParams, refresh]);

  const startTutorial = async (overrideTopic?: string, overrideDifficulty?: string) => {
    const t = overrideTopic || topic;
    const d = overrideDifficulty || difficulty;

    if (!isAuthenticated) {
      toast.error("Please sign in to start a tutorial");
      navigate("/auth");
      return;
    }
    if (!t || !d) {
      toast.error("Please select topic and difficulty");
      return;
    }
    if (!canUse) {
      toast.error(`You need ${costPerUse} credits to start. Buy a credit pack!`);
      navigate("/kids-drawing-pricing");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("kids-drawing-enhance", {
        body: { mode: "tutorial", topic: t, difficulty: d }
      });
      if (error) throw error;
      setTutorial(data);
      setCurrentStep(0);
      setWizardStep(3);
      refresh();
      toast.success("Let's start drawing! 🎨");
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to load tutorial");
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (templateTopic: string, templateDifficulty: string) => {
    setTopic(templateTopic);
    setDifficulty(templateDifficulty);
    startTutorial(templateTopic, templateDifficulty);
  };

  const resetWizard = () => {
    setTutorial(null);
    setWizardStep(0);
    setTopic("");
    setCategory("");
    setDifficulty("");
  };

  if (!isVerified) {
    return (
      <div className="min-h-screen">
      <FloatingHowItWorks title={__HIW_KIDSDRAWINGBUDDY.title} intro={__HIW_KIDSDRAWINGBUDDY.intro} steps={__HIW_KIDSDRAWINGBUDDY.steps} />
        <ParentalGate
          isOpen={true}
          storageKey={PARENTAL_GATE_KEY}
          onSuccess={() => checkVerification()}
          onCancel={() => navigate("/")}
          featureName="AI Drawing Buddy"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-6xl mx-auto space-y-6">
          <DrawingBuddyHero />

          <HeroRewardedAd sectionKey="page_kidsdrawingbuddy" />

          {/* Credit Balance Banner */}
          {isAuthenticated && (
            <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                  <span className="flex items-center gap-2 text-sm sm:text-base">
                    <Coins className="w-5 h-5 text-primary" />
                    Drawing Credits: <span className="text-primary font-black">{balance}</span>
                  </span>
                  <Button onClick={() => navigate("/kids-drawing-pricing")} size="sm" variant={canUse ? "outline" : "default"}>
                    <Coins className="w-4 h-4 mr-1" /> Buy Credits
                  </Button>
                </CardTitle>
                <CardDescription className="text-xs">
                  {costPerUse} credits per AI drawing tutorial • Save & Freestyle are free
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="tutorial" className="text-xs sm:text-sm">
                <Paintbrush className="w-3.5 h-3.5 mr-1" /> Tutorial
              </TabsTrigger>
              <TabsTrigger value="polish" className="text-xs sm:text-sm">
                <Wand2 className="w-3.5 h-3.5 mr-1" /> Polish
              </TabsTrigger>
              <TabsTrigger value="freestyle" className="text-xs sm:text-sm">
                <Palette className="w-3.5 h-3.5 mr-1" /> Freestyle
              </TabsTrigger>
              <TabsTrigger value="templates" className="text-xs sm:text-sm">
                <Zap className="w-3.5 h-3.5 mr-1" /> Quick
              </TabsTrigger>
              <TabsTrigger value="achievements" className="text-xs sm:text-sm">
                <Trophy className="w-3.5 h-3.5 mr-1" /> Awards
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tutorial" className="space-y-4">
              {!tutorial ? (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Paintbrush className="w-5 h-5" />
                      Create Your Tutorial
                    </CardTitle>
                    <CardDescription>Follow the steps to start your drawing journey</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <DrawingWizardStepper currentStep={wizardStep} steps={WIZARD_STEPS} />

                    {wizardStep === 0 && (
                      <DrawingCategorySelector
                        selectedCategory={category}
                        selectedTopic=""
                        onSelectCategory={(c) => { setCategory(c); setWizardStep(1); }}
                        onSelectTopic={() => {}}
                      />
                    )}

                    {wizardStep === 1 && (
                      <DrawingCategorySelector
                        selectedCategory={category}
                        selectedTopic={topic}
                        onSelectCategory={setCategory}
                        onSelectTopic={(t) => { setTopic(t); setWizardStep(2); }}
                      />
                    )}

                    {wizardStep === 2 && (
                      <div className="space-y-4">
                        <DrawingDifficultySelector
                          selected={difficulty}
                          onSelect={(d) => setDifficulty(d)}
                        />
                        {difficulty && (
                          <div className="flex gap-2">
                            {!isAuthenticated ? (
                              <Button onClick={() => navigate("/auth")} className="w-full">
                                Sign In to Start Drawing
                              </Button>
                            ) : !canUse ? (
                              <div className="w-full space-y-2">
                                <p className="text-sm text-muted-foreground text-center">
                                  Need {costPerUse} credits — you have {balance}
                                </p>
                                <Button onClick={() => navigate("/kids-drawing-pricing")} className="w-full">
                                  <Coins className="w-4 h-4 mr-2" /> Buy Credits
                                </Button>
                              </div>
                            ) : (
                              <Button onClick={() => startTutorial()} className="w-full" disabled={loading}>
                                {loading ? "Generating tutorial..." : `🎨 Start Drawing (${costPerUse} credits)`}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {wizardStep > 0 && wizardStep < 3 && (
                      <Button variant="ghost" size="sm" onClick={() => setWizardStep(wizardStep - 1)}>
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>{tutorial.title}</CardTitle>
                      <CardDescription>Step {currentStep + 1} of {tutorial.steps.length}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-background/50 p-4 rounded-lg">
                        <p className="font-medium text-lg">{tutorial.steps[currentStep].instruction}</p>
                      </div>
                      <DrawingCanvas
                        tutorialImage={tutorial.steps[currentStep].image}
                        stepNumber={currentStep + 1}
                        category={topic}
                      />
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0} className="flex-1">
                          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                        </Button>
                        <Button onClick={() => setCurrentStep(Math.min(tutorial.steps.length - 1, currentStep + 1))} disabled={currentStep === tutorial.steps.length - 1} className="flex-1">
                          Next <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                      <Button variant="outline" onClick={resetWizard} className="w-full">
                        Choose New Tutorial
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="polish" className="space-y-4">
              {!isAuthenticated ? (
                <Card>
                  <CardContent className="py-8 text-center space-y-3">
                    <Wand2 className="w-10 h-10 mx-auto text-primary" />
                    <p className="text-sm text-muted-foreground">Sign in to polish your sketches with AI.</p>
                    <Button onClick={() => navigate("/auth")}>Sign In</Button>
                  </CardContent>
                </Card>
              ) : (
                <SketchEnhancer
                  balance={balance}
                  onCreditsChanged={refresh}
                  onBuyCredits={() => navigate("/kids-drawing-pricing")}
                />
              )}
            </TabsContent>

            <TabsContent value="freestyle" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" /> Freestyle Canvas
                  </CardTitle>
                  <CardDescription>
                    Draw anything you want! Free to use — no credits needed.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DrawingCanvas stepNumber={0} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <QuickDrawTemplates
                onSelectTemplate={(t, d) => {
                  setActiveTab("tutorial");
                  handleTemplateSelect(t, d);
                }}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
              <DrawingAchievements completedCount={drawingsCount} />
            </TabsContent>
          </Tabs>

          {isAuthenticated && <DrawingGallery />}
        </div>
      </main>
    </div>
  );
};

export default KidsDrawingBuddy;
