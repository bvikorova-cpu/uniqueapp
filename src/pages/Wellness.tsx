import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Heart, Brain, Wind, Palette, BookOpen, Check, Volume2, TrendingUp } from "lucide-react";
import { MindfulnessChat } from "@/components/wellness/MindfulnessChat";
import { BreathingExercises } from "@/components/wellness/BreathingExercises";
import { GratitudeJournal } from "@/components/wellness/GratitudeJournal";
import { GroundingExercise } from "@/components/wellness/GroundingExercise";
import { DigitalMandala } from "@/components/wellness/DigitalMandala";
import { NatureSounds } from "@/components/wellness/NatureSounds";
import { BodyScanMeditation } from "@/components/wellness/BodyScanMeditation";
import { WellnessProgressDashboard } from "@/components/wellness/WellnessProgressDashboard";

const WELLNESS_PLANS = {
  basicMonthly: {
    name: "Basic Monthly",
    price: "€4.99/month",
    priceId: "price_1SQQ0zGaXSfGtYFtXRewT2s9",
    tier: "basic",
    isLifetime: false,
    features: [
      "Breathing Exercises",
      "5-4-3-2-1 Grounding",
      "Nature Sounds",
      "Body Scan Meditation"
    ]
  },
  premiumMonthly: {
    name: "Premium Monthly",
    price: "€9.99/month",
    priceId: "price_1SQQ1zGaXSfGtYFt773EG7rN",
    tier: "premium",
    isLifetime: false,
    features: [
      "AI Mindfulness Coach",
      "Breathing Exercises",
      "Gratitude Journal with AI",
      "5-4-3-2-1 Grounding",
      "Digital Mandala Drawing",
      "Body Scan Meditation"
    ]
  },
  basicLifetime: {
    name: "Basic Lifetime",
    price: "€29.99 once",
    priceId: "price_1SQQ2OGaXSfGtYFtSFCDoDRg",
    tier: "basic",
    isLifetime: true,
    features: [
      "Lifetime Access",
      "Breathing Exercises",
      "5-4-3-2-1 Grounding",
      "Nature Sounds",
      "Body Scan Meditation"
    ]
  },
  premiumLifetime: {
    name: "Premium Lifetime",
    price: "€49.99 once",
    priceId: "price_1SQQ2gGaXSfGtYFtpMEdnEfw",
    tier: "premium",
    isLifetime: true,
    features: [
      "Lifetime Access",
      "AI Mindfulness Coach",
      "Breathing Exercises",
      "Gratitude Journal with AI",
      "5-4-3-2-1 Grounding",
      "Digital Mandala Drawing",
      "Body Scan Meditation"
    ]
  }
};

export default function Wellness() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setSubscriptionStatus({ subscribed: false });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-wellness-subscription', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) throw error;
      setSubscriptionStatus(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Error",
        description: "Failed to check subscription status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  const handleCheckout = async (planKey: keyof typeof WELLNESS_PLANS) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to subscribe",
          variant: "destructive"
        });
        return;
      }

      setCheckoutLoading(planKey);
      const plan = WELLNESS_PLANS[planKey];

      const { data, error } = await supabase.functions.invoke('create-wellness-checkout', {
        body: { 
          priceId: plan.priceId,
          tier: plan.tier,
          isLifetime: plan.isLifetime
        },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout",
        variant: "destructive"
      });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const hasBasicAccess = subscriptionStatus?.subscribed && subscriptionStatus?.tier;
  const hasPremiumAccess = subscriptionStatus?.subscribed && subscriptionStatus?.tier === "premium";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-16 pt-16 sm:pt-16 max-w-7xl">
      <div className="mb-8 sm:mb-12 space-y-4 sm:space-y-6">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <Heart className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
            <span>Wellness & Mental Health</span>
          </h1>
          <p className="text-sm sm:text-xl text-muted-foreground px-2">
            Professional tools for relaxation, mindfulness, and mental wellbeing.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mt-4 sm:mt-8">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg transition-shadow">
            <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
              <Brain className="w-5 h-5 sm:w-8 sm:h-8 text-primary mb-1 sm:mb-2" />
              <h3 className="font-semibold mb-1 text-xs sm:text-base">AI Coach</h3>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                Empathetic AI assistant for your mental wellbeing
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg transition-shadow">
            <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
              <Wind className="w-5 h-5 sm:w-8 sm:h-8 text-primary mb-1 sm:mb-2" />
              <h3 className="font-semibold mb-1 text-xs sm:text-base">Breathing</h3>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                4-7-8 and Box Breathing with visual guidance
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg transition-shadow">
            <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
              <Heart className="w-5 h-5 sm:w-8 sm:h-8 text-primary mb-1 sm:mb-2" />
              <h3 className="font-semibold mb-1 text-xs sm:text-base">Body Scan</h3>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                Progressive relaxation with audio guidance
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg transition-shadow">
            <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
              <Volume2 className="w-5 h-5 sm:w-8 sm:h-8 text-primary mb-1 sm:mb-2" />
              <h3 className="font-semibold mb-1 text-xs sm:text-base">Sounds</h3>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                Rain, ocean waves, and forest for relaxation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What is Wellness & How to Use */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent mt-6">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">What is Wellness & Mental Health?</h3>
                  <p className="text-muted-foreground mb-3">
                    Our Wellness & Mental Health platform provides a comprehensive suite of professional-grade relaxation, mindfulness, 
                    and mental wellbeing tools. Whether you are dealing with daily stress, anxiety, trouble sleeping, or simply want to 
                    improve your overall mental health, our scientifically-backed techniques are designed to help you find inner peace and balance.
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  How to Use the Wellness Tools
                </h4>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li><strong>Subscribe to a Plan:</strong> Choose Basic (€4.99/month) for core tools or Premium (€9.99/month) for full access including AI Coach and Gratitude Journal</li>
                  <li><strong>Select a Tool:</strong> Navigate between tabs to access different wellness exercises based on your current needs</li>
                  <li><strong>Breathing Exercises:</strong> Follow visual guides for 4-7-8 relaxation breathing or Box Breathing to reduce stress instantly</li>
                  <li><strong>5-4-3-2-1 Grounding:</strong> Use this technique to anchor yourself in the present moment and reduce anxiety</li>
                  <li><strong>Body Scan Meditation:</strong> Follow audio-guided progressive muscle relaxation to release tension throughout your body</li>
                  <li><strong>Nature Sounds:</strong> Play calming rain, ocean waves, or forest ambience while working or sleeping</li>
                  <li><strong>AI Mindfulness Coach (Premium):</strong> Chat with an empathetic AI assistant trained in therapeutic techniques 24/7</li>
                  <li><strong>Gratitude Journal (Premium):</strong> Record daily gratitudes with AI-powered prompts and insights</li>
                  <li><strong>Digital Mandala (Premium):</strong> Create meditative art for mindful focus and creative relaxation</li>
                  <li><strong>Track Progress:</strong> View your wellness dashboard to monitor consistency and improvements over time</li>
                </ol>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Why Use Wellness Tools?</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Reduce stress and anxiety</strong> - Breathing exercises and meditation provably lower stress levels</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Improve sleep quality</strong> - Body scan and nature sounds help you fall asleep faster</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Enhanced focus</strong> - Grounding techniques bring you back to the present moment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>24/7 AI support</strong> - Mindfulness coach is always available when you need it</span>
                  </li>
                </ul>
              </div>

              <p className="text-xs text-muted-foreground border-t pt-3">
                💡 <strong>Tip:</strong> For best results, use wellness tools consistently — even just 5 minutes daily can significantly improve your mental wellbeing over time.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {!hasBasicAccess && (
        <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="w-6 h-6 text-primary" />
              Choose Your Wellness Plan
            </CardTitle>
            <CardDescription className="text-base">
              Select a plan to unlock our comprehensive relaxation and mindfulness tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(WELLNESS_PLANS).map(([key, plan]) => (
                <Card key={key} className="relative">
                  <CardHeader>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="text-2xl font-bold text-primary">{plan.price}</div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      onClick={() => handleCheckout(key as keyof typeof WELLNESS_PLANS)}
                      disabled={!!checkoutLoading}
                      className="w-full"
                    >
                      {checkoutLoading === key ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...</>
                      ) : (
                        'Subscribe'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {hasBasicAccess && (
        <Card className="mb-8 border-primary bg-gradient-to-br from-primary/10 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Your Active Wellness Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge variant="default" className="text-lg px-4 py-1">
                {subscriptionStatus.tier.toUpperCase()}
              </Badge>
              {subscriptionStatus.is_lifetime ? (
                <span className="text-sm">Lifetime Access ✨</span>
              ) : subscriptionStatus.subscription_end ? (
                <span className="text-sm">
                  Active until {new Date(subscriptionStatus.subscription_end).toLocaleDateString()}
                </span>
              ) : (
                <span className="text-sm">Active subscription</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="breathing" className="w-full">
        <div className="overflow-x-auto mb-4">
          <TabsList className="inline-flex w-max min-w-full sm:grid sm:w-full sm:grid-cols-8">
            <TabsTrigger value="progress" disabled={!hasBasicAccess} className="text-xs px-2">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Progress</span>
            </TabsTrigger>
            <TabsTrigger value="breathing" disabled={!hasBasicAccess} className="text-xs px-2">
              <Wind className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Breathing</span>
            </TabsTrigger>
            <TabsTrigger value="grounding" disabled={!hasBasicAccess} className="text-xs px-2">
              <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Grounding</span>
            </TabsTrigger>
            <TabsTrigger value="sounds" disabled={!hasBasicAccess} className="text-xs px-2">
              <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Sounds</span>
            </TabsTrigger>
            <TabsTrigger value="bodyscan" disabled={!hasBasicAccess} className="text-xs px-2">
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Body Scan</span>
            </TabsTrigger>
            <TabsTrigger value="chat" disabled={!hasPremiumAccess} className="text-xs px-2">
              <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">AI Coach</span>
            </TabsTrigger>
            <TabsTrigger value="journal" disabled={!hasPremiumAccess} className="text-xs px-2">
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Journal</span>
            </TabsTrigger>
            <TabsTrigger value="mandala" disabled={!hasPremiumAccess} className="text-xs px-2">
              <Palette className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Mandala</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="progress">
          {hasBasicAccess ? <WellnessProgressDashboard /> : <PremiumRequired />}
        </TabsContent>

        <TabsContent value="breathing">
          {hasBasicAccess ? <BreathingExercises /> : <PremiumRequired />}
        </TabsContent>

        <TabsContent value="grounding">
          {hasBasicAccess ? <GroundingExercise /> : <PremiumRequired />}
        </TabsContent>

        <TabsContent value="sounds">
          {hasBasicAccess ? <NatureSounds /> : <PremiumRequired />}
        </TabsContent>

        <TabsContent value="bodyscan">
          {hasBasicAccess ? <BodyScanMeditation /> : <PremiumRequired />}
        </TabsContent>

        <TabsContent value="chat">
          {hasPremiumAccess ? <MindfulnessChat /> : <PremiumRequired premium />}
        </TabsContent>

        <TabsContent value="journal">
          {hasPremiumAccess ? <GratitudeJournal /> : <PremiumRequired premium />}
        </TabsContent>

        <TabsContent value="mandala">
          {hasPremiumAccess ? <DigitalMandala /> : <PremiumRequired premium />}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PremiumRequired({ premium = false }: { premium?: boolean }) {
  return (
    <Card className="mt-4">
      <CardContent className="pt-6 text-center">
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">
          {premium ? 'Premium Plan' : 'Subscription'} Required
        </h3>
        <p className="text-muted-foreground">
          Subscribe to unlock this wellness tool and discover inner peace
        </p>
      </CardContent>
    </Card>
  );
}
