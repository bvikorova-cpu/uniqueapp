import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, ChevronLeft, Sparkles, Crown, Settings, Paintbrush, Palette, Zap, Trophy } from "lucide-react";
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
import { useKidsDrawingSubscription, useCreateDrawingCheckout, useIncrementDrawingUsage, useOpenDrawingCustomerPortal } from "@/hooks/useKidsDrawingSubscription";
import { useNavigate } from "react-router-dom";
import { useKidsDrawingGallery } from "@/hooks/useKidsDrawingGallery";
import { ParentalGate } from "@/components/kids/ParentalGate";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
const PARENTAL_GATE_KEY = "parental_gate_verified_kids_drawing_buddy";
const WIZARD_STEPS = ["Category", "Topic", "Difficulty", "Draw!"];

const KidsDrawingBuddy = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(false);
  const [tutorial, setTutorial] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardStep, setWizardStep] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("tutorial");
  const [freestyleMode, setFreestyleMode] = useState(false);

  const { data: subscription, isLoading: subLoading } = useKidsDrawingSubscription();
  const { drawings } = useKidsDrawingGallery();
  const createCheckout = useCreateDrawingCheckout();
  const incrementUsage = useIncrementDrawingUsage();
  const openPortal = useOpenDrawingCustomerPortal();

  const galleryLocked = !subscription?.subscribed && (drawings?.length || 0) > 0;

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
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(() => { checkAuth(); });
    return () => authSub.unsubscribe();
  }, []);

  const canStartTutorial = () => {
    if (!isAuthenticated) return false;
    if (subscription?.subscribed) return true;
    return (subscription?.tutorials_used || 0) < (subscription?.tutorials_limit || 1);
  };

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
    if (!canStartTutorial()) {
      toast.error("You've used your free tutorial. Upgrade to Premium for unlimited access!");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('kids-drawing-tutorial', {
        body: { topic: t, difficulty: d }
      });
      if (error) throw error;
      setTutorial(data);
      setCurrentStep(0);
      setWizardStep(3);
      await incrementUsage.mutateAsync();
      toast.success("Let's start drawing! 🎨");
    } catch (error: any) {
      console.error('Error:', error);
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
    setFreestyleMode(false);
  };

  if (!isVerified) {
    return (
      <div className="min-h-screen">
        <ParentalGate
          isOpen={true}
          storageKey={PARENTAL_GATE_KEY}
          onSuccess={() => setIsVerified(true)}
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
          {/* Hero */}
          <DrawingBuddyHero />

          <HeroRewardedAd sectionKey="page_kidsdrawingbuddy" />

          {/* Subscription Status */}
          {isAuthenticated && (
            <Card className={subscription?.subscribed ? "border-2 border-primary" : "border-2"}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                  <span className="flex items-center gap-2 text-sm sm:text-base">
                    {subscription?.subscribed ? (
                      <><Crown className="w-5 h-5 text-primary" /> Premium Member</>
                    ) : (
                      <><Sparkles className="w-5 h-5" /> Free Plan</>
                    )}
                  </span>
                  <div className="flex gap-2">
                    {subscription?.subscribed ? (
                      <Button onClick={() => openPortal.mutate()} size="sm" variant="outline" disabled={openPortal.isPending}>
                        <Settings className="w-4 h-4 mr-1" /> Manage
                      </Button>
                    ) : (
                      <Button onClick={() => createCheckout.mutate()} size="sm" disabled={createCheckout.isPending}>
                        <Crown className="w-4 h-4 mr-1" /> Upgrade
                      </Button>
                    )}
                  </div>
                </CardTitle>
                <CardDescription className="text-xs">
                  {subscription?.subscribed
                    ? `Unlimited tutorials${subscription?.subscription_end ? ` • Renews ${new Date(subscription.subscription_end).toLocaleDateString()}` : ""}`
                    : `${(subscription?.tutorials_limit || 1) - (subscription?.tutorials_used || 0)} free tutorial(s) remaining`}
                </CardDescription>
              </CardHeader>
              {!subscription?.subscribed && (
                <CardContent className="pt-0">
                  <div className="bg-primary/5 rounded-lg p-3 text-xs space-y-1">
                    <h4 className="font-semibold flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 text-primary" /> Premium – €5/mo
                    </h4>
                    <div className="grid grid-cols-2 gap-1 text-muted-foreground">
                      <span>✓ Unlimited tutorials</span>
                      <span>✓ All topics & levels</span>
                      <span>✓ Full gallery access</span>
                      <span>✓ Download artwork</span>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="tutorial" className="text-xs sm:text-sm">
                <Paintbrush className="w-3.5 h-3.5 mr-1" /> Tutorial
              </TabsTrigger>
              <TabsTrigger value="freestyle" className="text-xs sm:text-sm">
                <Palette className="w-3.5 h-3.5 mr-1" /> Freestyle
              </TabsTrigger>
              <TabsTrigger value="templates" className="text-xs sm:text-sm">
                <Zap className="w-3.5 h-3.5 mr-1" /> Quick Draw
              </TabsTrigger>
              <TabsTrigger value="achievements" className="text-xs sm:text-sm">
                <Trophy className="w-3.5 h-3.5 mr-1" /> Awards
              </TabsTrigger>
            </TabsList>

            {/* TUTORIAL TAB - Wizard */}
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
                        onSelectCategory={(c) => {
                          setCategory(c);
                          setWizardStep(1);
                        }}
                        onSelectTopic={() => {}}
                      />
                    )}

                    {wizardStep === 1 && (
                      <DrawingCategorySelector
                        selectedCategory={category}
                        selectedTopic={topic}
                        onSelectCategory={setCategory}
                        onSelectTopic={(t) => {
                          setTopic(t);
                          setWizardStep(2);
                        }}
                      />
                    )}

                    {wizardStep === 2 && (
                      <div className="space-y-4">
                        <DrawingDifficultySelector
                          selected={difficulty}
                          onSelect={(d) => {
                            setDifficulty(d);
                          }}
                        />
                        {difficulty && (
                          <div className="flex gap-2">
                            {!isAuthenticated ? (
                              <Button onClick={() => navigate("/auth")} className="w-full">
                                Sign In to Start Drawing
                              </Button>
                            ) : !canStartTutorial() ? (
                              <div className="w-full space-y-2">
                                <p className="text-sm text-muted-foreground text-center">
                                  Free tutorial used this month
                                </p>
                                <Button onClick={() => createCheckout.mutate()} className="w-full" disabled={createCheckout.isPending}>
                                  <Crown className="w-4 h-4 mr-2" /> Upgrade for Unlimited
                                </Button>
                              </div>
                            ) : (
                              <Button onClick={() => startTutorial()} className="w-full" disabled={loading}>
                                {loading ? "Generating tutorial..." : "🎨 Start Drawing!"}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Back button */}
                    {wizardStep > 0 && wizardStep < 3 && (
                      <Button variant="ghost" size="sm" onClick={() => setWizardStep(wizardStep - 1)}>
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                /* Active Tutorial */
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>{tutorial.title}</CardTitle>
                      <CardDescription>
                        Step {currentStep + 1} of {tutorial.steps.length}
                      </CardDescription>
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
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                          disabled={currentStep === 0}
                          className="flex-1"
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                        </Button>
                        <Button
                          onClick={() => setCurrentStep(Math.min(tutorial.steps.length - 1, currentStep + 1))}
                          disabled={currentStep === tutorial.steps.length - 1}
                          className="flex-1"
                        >
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

            {/* FREESTYLE TAB */}
            <TabsContent value="freestyle" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Freestyle Canvas
                  </CardTitle>
                  <CardDescription>
                    Draw anything you want! No tutorial needed — just pure creativity.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DrawingCanvas stepNumber={0} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* QUICK DRAW TAB */}
            <TabsContent value="templates" className="space-y-4">
              <QuickDrawTemplates
                onSelectTemplate={(t, d) => {
                  setActiveTab("tutorial");
                  handleTemplateSelect(t, d);
                }}
                loading={loading}
              />
            </TabsContent>

            {/* ACHIEVEMENTS TAB */}
            <TabsContent value="achievements" className="space-y-4">
              <DrawingAchievements completedCount={subscription?.tutorials_used || 0} />
            </TabsContent>
          </Tabs>

          {/* Gallery */}
          {isAuthenticated && (
            galleryLocked ? (
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-muted-foreground">
                    <Crown className="w-5 h-5" /> Gallery Locked
                  </CardTitle>
                  <CardDescription>
                    Free users can save drawings but need Premium to view the full gallery.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => createCheckout.mutate()} className="w-full" disabled={createCheckout.isPending}>
                    <Crown className="w-4 h-4 mr-2" /> Unlock Gallery with Premium
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <DrawingGallery />
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default KidsDrawingBuddy;
