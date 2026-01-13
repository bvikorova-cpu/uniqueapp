import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Paintbrush, ChevronRight, ChevronLeft, Sparkles, Crown, Info, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DrawingCanvas } from "@/components/kids-drawing/DrawingCanvas";
import { DrawingGallery } from "@/components/kids-drawing/DrawingGallery";
import { useKidsDrawingSubscription, useCreateDrawingCheckout, useIncrementDrawingUsage, useOpenDrawingCustomerPortal } from "@/hooks/useKidsDrawingSubscription";
import { useNavigate } from "react-router-dom";
import { useKidsDrawingGallery } from "@/hooks/useKidsDrawingGallery";
import { ParentalGate } from "@/components/kids/ParentalGate";

const PARENTAL_GATE_KEY = "parental_gate_verified_kids_drawing_buddy";

const KidsDrawingBuddy = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(false);
  const [tutorial, setTutorial] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { data: subscription, isLoading: subLoading } = useKidsDrawingSubscription();
  const { drawings } = useKidsDrawingGallery();
  const createCheckout = useCreateDrawingCheckout();
  const incrementUsage = useIncrementDrawingUsage();
  const openPortal = useOpenDrawingCustomerPortal();

  // Check if free user has saved drawings (gallery locked after first save)
  const galleryLocked = !subscription?.subscribed && (drawings?.length || 0) > 0;

  // PARENTAL GATE STATE - BLOCK BY DEFAULT
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

  // Keep session-based verification honest while the user stays on the page
  useEffect(() => {
    const tick = () => {
      const stored = sessionStorage.getItem(PARENTAL_GATE_KEY);
      if (!stored) {
        if (isVerified) setIsVerified(false);
        return;
      }
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

  const handleVerificationSuccess = () => {
    setIsVerified(true);
  };

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

  // ========== BLOCKING PARENTAL GATE ==========
  if (!isVerified) {
    return (
      <div className="min-h-screen">
        <ParentalGate
          isOpen={true}
          storageKey={PARENTAL_GATE_KEY}
          onSuccess={handleVerificationSuccess}
          onCancel={() => {
            navigate("/");
          }}
          featureName="AI Drawing Buddy"
        />
      </div>
    );
  }

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
                  <div className="flex gap-2">
                    {subscription?.subscribed && (
                      <Button onClick={() => openPortal.mutate()} size="sm" variant="outline" disabled={openPortal.isPending}>
                        <Settings className="w-4 h-4 mr-2" />
                        Manage Subscription
                      </Button>
                    )}
                    {!subscription?.subscribed && (
                      <Button onClick={() => createCheckout.mutate()} size="sm" disabled={createCheckout.isPending}>
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade to Premium
                      </Button>
                    )}
                  </div>
                </CardTitle>
                <CardDescription>
                  {subscription?.subscribed
                    ? `Unlimited AI-powered drawing tutorials${subscription?.subscription_end ? ` • Renews ${new Date(subscription.subscription_end).toLocaleDateString()}` : ""}`
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
                      <li>✓ Full Gallery access with all saved drawings</li>
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
                    <SelectContent className="max-h-[300px]">
                      {/* Animals */}
                      <SelectItem value="dog">Dog 🐶</SelectItem>
                      <SelectItem value="cat">Cat 🐱</SelectItem>
                      <SelectItem value="bunny">Bunny 🐰</SelectItem>
                      <SelectItem value="elephant">Elephant 🐘</SelectItem>
                      <SelectItem value="lion">Lion 🦁</SelectItem>
                      <SelectItem value="tiger">Tiger 🐯</SelectItem>
                      <SelectItem value="bear">Bear 🐻</SelectItem>
                      <SelectItem value="panda">Panda 🐼</SelectItem>
                      <SelectItem value="monkey">Monkey 🐵</SelectItem>
                      <SelectItem value="penguin">Penguin 🐧</SelectItem>
                      <SelectItem value="owl">Owl 🦉</SelectItem>
                      <SelectItem value="dolphin">Dolphin 🐬</SelectItem>
                      <SelectItem value="whale">Whale 🐳</SelectItem>
                      <SelectItem value="shark">Shark 🦈</SelectItem>
                      <SelectItem value="turtle">Turtle 🐢</SelectItem>
                      <SelectItem value="frog">Frog 🐸</SelectItem>
                      <SelectItem value="butterfly">Butterfly 🦋</SelectItem>
                      <SelectItem value="bee">Bee 🐝</SelectItem>
                      <SelectItem value="ladybug">Ladybug 🐞</SelectItem>
                      <SelectItem value="horse">Horse 🐴</SelectItem>
                      <SelectItem value="giraffe">Giraffe 🦒</SelectItem>
                      <SelectItem value="zebra">Zebra 🦓</SelectItem>
                      <SelectItem value="fox">Fox 🦊</SelectItem>
                      <SelectItem value="wolf">Wolf 🐺</SelectItem>
                      <SelectItem value="koala">Koala 🐨</SelectItem>
                      <SelectItem value="dinosaur">Dinosaur 🦕</SelectItem>
                      <SelectItem value="t-rex">T-Rex 🦖</SelectItem>
                      
                      {/* Fantasy */}
                      <SelectItem value="unicorn">Unicorn 🦄</SelectItem>
                      <SelectItem value="dragon">Dragon 🐉</SelectItem>
                      <SelectItem value="mermaid">Mermaid 🧜‍♀️</SelectItem>
                      <SelectItem value="fairy">Fairy 🧚</SelectItem>
                      <SelectItem value="wizard">Wizard 🧙</SelectItem>
                      <SelectItem value="princess">Princess 👸</SelectItem>
                      <SelectItem value="prince">Prince 🤴</SelectItem>
                      <SelectItem value="knight">Knight ⚔️</SelectItem>
                      <SelectItem value="pirate">Pirate 🏴‍☠️</SelectItem>
                      <SelectItem value="superhero">Superhero 🦸</SelectItem>
                      <SelectItem value="robot">Robot 🤖</SelectItem>
                      <SelectItem value="alien">Alien 👽</SelectItem>
                      <SelectItem value="ghost">Friendly Ghost 👻</SelectItem>
                      <SelectItem value="monster">Cute Monster 👾</SelectItem>
                      <SelectItem value="phoenix">Phoenix 🔥</SelectItem>
                      
                      {/* Nature */}
                      <SelectItem value="tree">Tree 🌳</SelectItem>
                      <SelectItem value="flower">Flower 🌸</SelectItem>
                      <SelectItem value="sunflower">Sunflower 🌻</SelectItem>
                      <SelectItem value="rose">Rose 🌹</SelectItem>
                      <SelectItem value="rainbow">Rainbow 🌈</SelectItem>
                      <SelectItem value="sun">Sun ☀️</SelectItem>
                      <SelectItem value="moon">Moon 🌙</SelectItem>
                      <SelectItem value="star">Star ⭐</SelectItem>
                      <SelectItem value="cloud">Cloud ☁️</SelectItem>
                      <SelectItem value="mountain">Mountain ⛰️</SelectItem>
                      <SelectItem value="ocean">Ocean 🌊</SelectItem>
                      <SelectItem value="waterfall">Waterfall 💧</SelectItem>
                      <SelectItem value="cactus">Cactus 🌵</SelectItem>
                      <SelectItem value="mushroom">Mushroom 🍄</SelectItem>
                      
                      {/* Vehicles */}
                      <SelectItem value="car">Car 🚗</SelectItem>
                      <SelectItem value="truck">Truck 🚚</SelectItem>
                      <SelectItem value="bus">Bus 🚌</SelectItem>
                      <SelectItem value="train">Train 🚂</SelectItem>
                      <SelectItem value="airplane">Airplane ✈️</SelectItem>
                      <SelectItem value="helicopter">Helicopter 🚁</SelectItem>
                      <SelectItem value="rocket">Rocket 🚀</SelectItem>
                      <SelectItem value="boat">Boat ⛵</SelectItem>
                      <SelectItem value="ship">Ship 🚢</SelectItem>
                      <SelectItem value="submarine">Submarine 🛳️</SelectItem>
                      <SelectItem value="bicycle">Bicycle 🚲</SelectItem>
                      <SelectItem value="motorcycle">Motorcycle 🏍️</SelectItem>
                      <SelectItem value="fire-truck">Fire Truck 🚒</SelectItem>
                      <SelectItem value="ambulance">Ambulance 🚑</SelectItem>
                      <SelectItem value="police-car">Police Car 🚓</SelectItem>
                      <SelectItem value="tractor">Tractor 🚜</SelectItem>
                      
                      {/* Food */}
                      <SelectItem value="pizza">Pizza 🍕</SelectItem>
                      <SelectItem value="burger">Burger 🍔</SelectItem>
                      <SelectItem value="ice-cream">Ice Cream 🍦</SelectItem>
                      <SelectItem value="cupcake">Cupcake 🧁</SelectItem>
                      <SelectItem value="cake">Birthday Cake 🎂</SelectItem>
                      <SelectItem value="donut">Donut 🍩</SelectItem>
                      <SelectItem value="apple">Apple 🍎</SelectItem>
                      <SelectItem value="banana">Banana 🍌</SelectItem>
                      <SelectItem value="watermelon">Watermelon 🍉</SelectItem>
                      <SelectItem value="strawberry">Strawberry 🍓</SelectItem>
                      <SelectItem value="cookie">Cookie 🍪</SelectItem>
                      <SelectItem value="lollipop">Lollipop 🍭</SelectItem>
                      
                      {/* Buildings & Places */}
                      <SelectItem value="house">House 🏠</SelectItem>
                      <SelectItem value="castle">Castle 🏰</SelectItem>
                      <SelectItem value="lighthouse">Lighthouse 🏝️</SelectItem>
                      <SelectItem value="treehouse">Treehouse 🌲</SelectItem>
                      <SelectItem value="windmill">Windmill 🌾</SelectItem>
                      <SelectItem value="igloo">Igloo ❄️</SelectItem>
                      
                      {/* People & Characters */}
                      <SelectItem value="astronaut">Astronaut 👨‍🚀</SelectItem>
                      <SelectItem value="chef">Chef 👨‍🍳</SelectItem>
                      <SelectItem value="firefighter">Firefighter 👨‍🚒</SelectItem>
                      <SelectItem value="doctor">Doctor 👨‍⚕️</SelectItem>
                      <SelectItem value="teacher">Teacher 👩‍🏫</SelectItem>
                      <SelectItem value="ballerina">Ballerina 🩰</SelectItem>
                      <SelectItem value="ninja">Ninja 🥷</SelectItem>
                      <SelectItem value="cowboy">Cowboy 🤠</SelectItem>
                      <SelectItem value="clown">Clown 🤡</SelectItem>
                      
                      {/* Sports & Hobbies */}
                      <SelectItem value="soccer-ball">Soccer Ball ⚽</SelectItem>
                      <SelectItem value="basketball">Basketball 🏀</SelectItem>
                      <SelectItem value="football">Football 🏈</SelectItem>
                      <SelectItem value="baseball">Baseball ⚾</SelectItem>
                      <SelectItem value="guitar">Guitar 🎸</SelectItem>
                      <SelectItem value="piano">Piano 🎹</SelectItem>
                      <SelectItem value="balloon">Balloon 🎈</SelectItem>
                      <SelectItem value="kite">Kite 🪁</SelectItem>
                      <SelectItem value="teddy-bear">Teddy Bear 🧸</SelectItem>
                      
                      {/* Seasonal */}
                      <SelectItem value="snowman">Snowman ⛄</SelectItem>
                      <SelectItem value="christmas-tree">Christmas Tree 🎄</SelectItem>
                      <SelectItem value="santa">Santa Claus 🎅</SelectItem>
                      <SelectItem value="pumpkin">Pumpkin 🎃</SelectItem>
                      <SelectItem value="easter-bunny">Easter Bunny 🐰</SelectItem>
                      <SelectItem value="heart">Heart ❤️</SelectItem>
                      <SelectItem value="gift">Gift Box 🎁</SelectItem>
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
                    category={topic}
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

          {/* Drawing Gallery - show when logged in */}
          {isAuthenticated && (
            galleryLocked ? (
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-muted-foreground">
                    <Crown className="w-5 h-5" />
                    Gallery Locked
                  </CardTitle>
                  <CardDescription>
                    Free users can save drawings but need Premium to view the full gallery.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => createCheckout.mutate()} className="w-full" disabled={createCheckout.isPending}>
                    <Crown className="w-4 h-4 mr-2" />
                    Unlock Gallery with Premium
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <DrawingGallery />
            )
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default KidsDrawingBuddy;
