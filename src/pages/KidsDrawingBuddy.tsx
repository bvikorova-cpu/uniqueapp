import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Paintbrush, ChevronRight, ChevronLeft, Sparkles, Crown, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DrawingCanvas } from "@/components/kids-drawing/DrawingCanvas";
import { useKidsDrawingSubscription, useCreateDrawingCheckout, useIncrementDrawingUsage } from "@/hooks/useKidsDrawingSubscription";
import { useNavigate } from "react-router-dom";

const KidsDrawingBuddy = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(false);
  const [tutorial, setTutorial] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { data: subscription, isLoading: subLoading } = useKidsDrawingSubscription();
  const createCheckout = useCreateDrawingCheckout();
  const incrementUsage = useIncrementDrawingUsage();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

    return () => authSub.unsubscribe();
  }, []);

  const canStartTutorial = () => {
    if (!isAuthenticated) return false;
    if (subscription?.subscribed) return true;
    return (subscription?.tutorials_used || 0) < (subscription?.tutorials_limit || 1);
  };

  const startTutorial = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to start a tutorial");
      navigate("/auth");
      return;
    }

    if (!topic || !difficulty) {
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
        body: { topic, difficulty }
      });

      if (error) throw error;
      
      setTutorial(data);
      setCurrentStep(0);
      
      // Increment usage counter
      await incrementUsage.mutateAsync();
      
      toast.success("Let's start drawing! 🎨");
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Failed to load tutorial");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI Drawing Buddy 🎨
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Learn to draw step by step with AI-powered tutorials and an interactive canvas
            </p>
          </div>

          {/* How It Works Section */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                    1
                  </div>
                  <h3 className="font-semibold">Choose Your Topic</h3>
                  <p className="text-sm text-muted-foreground">
                    Select what you want to draw - animals, nature, people, vehicles, or fantasy creatures
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                    2
                  </div>
                  <h3 className="font-semibold">Follow Step-by-Step</h3>
                  <p className="text-sm text-muted-foreground">
                    AI generates unique tutorial steps with reference images. Draw along on the interactive canvas
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                    3
                  </div>
                  <h3 className="font-semibold">Create & Download</h3>
                  <p className="text-sm text-muted-foreground">
                    Use tools like brushes, shapes, colors, undo/redo. Download your masterpiece when done!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Status Card */}
          {isAuthenticated && (
            <Card className={subscription?.subscribed ? "border-2 border-primary" : "border-2"}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {subscription?.subscribed ? (
                      <>
                        <Crown className="w-5 h-5 text-primary" />
                        Premium Member
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Free Plan
                      </>
                    )}
                  </span>
                  {!subscription?.subscribed && (
                    <Button onClick={() => createCheckout.mutate()} size="sm" disabled={createCheckout.isPending}>
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Premium
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  {subscription?.subscribed
                    ? "Unlimited AI-powered drawing tutorials"
                    : `${(subscription?.tutorials_limit || 1) - (subscription?.tutorials_used || 0)} free tutorial${(subscription?.tutorials_limit || 1) - (subscription?.tutorials_used || 0) !== 1 ? 's' : ''} remaining this month`}
                </CardDescription>
              </CardHeader>
              {!subscription?.subscribed && (
                <CardContent>
                  <div className="bg-primary/5 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Crown className="w-4 h-4 text-primary" />
                      Premium Benefits - €5/month
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>✓ Unlimited drawing tutorials</li>
                      <li>✓ Access to all topics and difficulty levels</li>
                      <li>✓ AI-generated step-by-step images</li>
                      <li>✓ Full canvas tools (shapes, colors, undo/redo)</li>
                      <li>✓ Download your artwork anytime</li>
                    </ul>
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {!tutorial ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Paintbrush className="w-5 h-5" />
                  Choose What to Draw
                </CardTitle>
                <CardDescription>
                  Pick a topic and we'll teach you step by step!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">What do you want to draw?</label>
                  <Select value={topic} onValueChange={setTopic}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="animals">Animals 🐶</SelectItem>
                      <SelectItem value="nature">Nature 🌳</SelectItem>
                      <SelectItem value="people">People 👨</SelectItem>
                      <SelectItem value="vehicles">Vehicles 🚗</SelectItem>
                      <SelectItem value="fantasy">Fantasy 🦄</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Difficulty</label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="How hard?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy ⭐</SelectItem>
                      <SelectItem value="medium">Medium ⭐⭐</SelectItem>
                      <SelectItem value="hard">Hard ⭐⭐⭐</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {!isAuthenticated ? (
                  <Button onClick={() => navigate("/auth")} className="w-full">
                    Sign In to Start Drawing
                  </Button>
                ) : !canStartTutorial() ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground text-center">
                      You've used your free tutorial this month
                    </p>
                    <Button onClick={() => createCheckout.mutate()} className="w-full" disabled={createCheckout.isPending}>
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade for Unlimited Access
                    </Button>
                  </div>
                ) : (
                  <Button onClick={startTutorial} className="w-full" disabled={loading}>
                    {loading ? "Loading tutorial..." : "Start Drawing!"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
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

                  {/* Drawing Canvas */}
                  <DrawingCanvas 
                    tutorialImage={tutorial.steps[currentStep].image}
                    stepNumber={currentStep + 1}
                  />

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                      disabled={currentStep === 0}
                      className="flex-1"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(Math.min(tutorial.steps.length - 1, currentStep + 1))}
                      disabled={currentStep === tutorial.steps.length - 1}
                      className="flex-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>

                  <Button variant="outline" onClick={() => setTutorial(null)} className="w-full">
                    Choose New Tutorial
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default KidsDrawingBuddy;
