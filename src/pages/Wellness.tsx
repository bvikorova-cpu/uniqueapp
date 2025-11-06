import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Heart, Brain, Wind, Palette, BookOpen, Check, Volume2 } from "lucide-react";
import { MindfulnessChat } from "@/components/wellness/MindfulnessChat";
import { BreathingExercises } from "@/components/wellness/BreathingExercises";
import { GratitudeJournal } from "@/components/wellness/GratitudeJournal";
import { GroundingExercise } from "@/components/wellness/GroundingExercise";
import { DigitalMandala } from "@/components/wellness/DigitalMandala";
import { NatureSounds } from "@/components/wellness/NatureSounds";
import { BodyScanMeditation } from "@/components/wellness/BodyScanMeditation";

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
      "Digital Mandalas",
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
      "Digital Mandalas",
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 space-y-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 flex items-center gap-3">
            <Heart className="w-10 h-10 text-primary" />
            Wellness & Duševné Zdravie
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Profesionálne nástroje pre relaxáciu, mindfulness a duševnú pohodu. Redukujte stres, 
            zlepšite spánok a kultivujte vnútorný pokoj pomocou vedecky overených techník.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="pt-6">
              <Brain className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">AI Mindfulness Coach</h3>
              <p className="text-sm text-muted-foreground">
                Inteligentný asistent s empatiou pre vašu mentálnu pohodu
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="pt-6">
              <Wind className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Dychové Cvičenia</h3>
              <p className="text-sm text-muted-foreground">
                4-7-8 a Box Breathing techniky s vizuálnym vedením
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="pt-6">
              <Heart className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Body Scan Meditácia</h3>
              <p className="text-sm text-muted-foreground">
                Postupné uvoľnenie tela s audio vodením a vizualizáciou
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="pt-6">
              <Volume2 className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Zvuky Prírody</h3>
              <p className="text-sm text-muted-foreground">
                Dážď, vlny a les pre hlbšiu relaxáciu a koncentráciu
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent mt-4">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Prečo Wellness Nástroje?</h3>
                <p className="text-muted-foreground mb-3">
                  V dnešnej uponáhľanej dobe je starostlivosť o duševné zdravie dôležitejšia než kedykoľvek predtým. 
                  Naše nástroje využívajú vedecky overené techniky mindfulness, meditácie a relaxácie.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Redukcia stresu a úzkosti</strong> - Dychové cvičenia a meditácie dokázateľne znižujú stres</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Zlepšenie spánku</strong> - Body scan a zvuky prírody pomáhajú pri zaspávaní</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Zvýšená koncentrácia</strong> - Grounding techniky vás vrátia do prítomného momentu</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>AI podpora 24/7</strong> - Mindfulness coach je vždy k dispozícii, keď ho potrebujete</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
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
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="breathing" disabled={!hasBasicAccess}>
            <Wind className="w-4 h-4 mr-2" />
            Breathing
          </TabsTrigger>
          <TabsTrigger value="grounding" disabled={!hasBasicAccess}>
            <Brain className="w-4 h-4 mr-2" />
            Grounding
          </TabsTrigger>
          <TabsTrigger value="sounds" disabled={!hasBasicAccess}>
            <Volume2 className="w-4 h-4 mr-2" />
            Sounds
          </TabsTrigger>
          <TabsTrigger value="bodyscan" disabled={!hasBasicAccess}>
            <Heart className="w-4 h-4 mr-2" />
            Body Scan
          </TabsTrigger>
          <TabsTrigger value="chat" disabled={!hasPremiumAccess}>
            <Brain className="w-4 h-4 mr-2" />
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
          {premium ? 'Premium' : 'Subscription'} Required
        </h3>
        <p className="text-muted-foreground">
          Subscribe to access this wellness tool and find your inner peace
        </p>
      </CardContent>
    </Card>
  );
}
