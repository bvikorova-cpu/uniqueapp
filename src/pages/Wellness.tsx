import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Heart, Brain, Wind, Palette, BookOpen, Check } from "lucide-react";
import { MindfulnessChat } from "@/components/wellness/MindfulnessChat";
import { BreathingExercises } from "@/components/wellness/BreathingExercises";
import { GratitudeJournal } from "@/components/wellness/GratitudeJournal";
import { GroundingExercise } from "@/components/wellness/GroundingExercise";
import { DigitalMandala } from "@/components/wellness/DigitalMandala";

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
      "Digital Mandalas"
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
      "Digital Mandalas"
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <Heart className="w-8 h-8 text-primary" />
          Wellness & Relaxation
        </h1>
        <p className="text-muted-foreground">
          Find peace, reduce stress, and cultivate inner calm with our wellness tools
        </p>
      </div>

      {!hasBasicAccess && (
        <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Choose Your Wellness Plan
            </CardTitle>
            <CardDescription>
              Select a plan to access our relaxation and mindfulness tools
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
              Your Wellness Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge variant="default" className="text-lg px-4 py-1">
                {subscriptionStatus.tier.toUpperCase()}
              </Badge>
              {subscriptionStatus.is_lifetime ? (
                <span className="text-sm">Lifetime Access</span>
              ) : (
                <span className="text-sm">
                  Active until {new Date(subscriptionStatus.subscription_end).toLocaleDateString()}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="breathing" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="breathing" disabled={!hasBasicAccess}>
            <Wind className="w-4 h-4 mr-2" />
            Breathing
          </TabsTrigger>
          <TabsTrigger value="grounding" disabled={!hasBasicAccess}>
            <Brain className="w-4 h-4 mr-2" />
            Grounding
          </TabsTrigger>
          <TabsTrigger value="chat" disabled={!hasPremiumAccess}>
            <Heart className="w-4 h-4 mr-2" />
            AI Coach
          </TabsTrigger>
          <TabsTrigger value="journal" disabled={!hasPremiumAccess}>
            <BookOpen className="w-4 h-4 mr-2" />
            Journal
          </TabsTrigger>
          <TabsTrigger value="mandala" disabled={!hasPremiumAccess}>
            <Palette className="w-4 h-4 mr-2" />
            Mandala
          </TabsTrigger>
        </TabsList>

        <TabsContent value="breathing">
          {hasBasicAccess ? <BreathingExercises /> : <PremiumRequired />}
        </TabsContent>

        <TabsContent value="grounding">
          {hasBasicAccess ? <GroundingExercise /> : <PremiumRequired />}
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
          {premium ? 'Premium' : 'Subscription'} Required
        </h3>
        <p className="text-muted-foreground">
          Subscribe to access this wellness tool and find your inner peace
        </p>
      </CardContent>
    </Card>
  );
}
