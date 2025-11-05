import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";

const HomeDecorSubscription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data } = await supabase
      .from('decor_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    setCurrentSubscription(data);
    setLoading(false);
  };

  const handleSubscribe = async (tier: 'free' | 'pro') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    if (tier === 'pro') {
      toast({
        title: "Stripe integrácia",
        description: "Stripe checkout bude pridaný čoskoro",
      });
      return;
    }

    toast({
      title: "Free plán aktívny",
      description: "Máte 2 AI návrhy mesačne",
    });
  };

  const plans = [
    {
      tier: 'free',
      name: 'Free',
      price: 0,
      designs: 2,
      features: [
        '2 AI návrhy mesačne',
        'Základné štýly',
        'Odporúčané produkty',
        'Uloženie 1 projektu'
      ]
    },
    {
      tier: 'pro',
      name: 'Pro',
      price: 7.99,
      designs: 50,
      popular: true,
      features: [
        '50 AI návrhov mesačne',
        'Všetky štýly & customizácia',
        'Detailné produktové návrhy',
        'Neobmedzené uložené projekty',
        'AR preview (€0.99/náhľad)',
        'Prioritná podpora',
        'Export do PDF'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Home className="h-12 w-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">
              Home Decor Plans
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Vyberte si plán podľa vašich potrieb
          </p>
        </div>

        {/* Current Plan */}
        {currentSubscription && (
          <Card className="mb-8 bg-gradient-subtle">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Váš aktuálny plán</p>
                  <p className="text-2xl font-bold capitalize">{currentSubscription.tier}</p>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {currentSubscription.designs_used}/{currentSubscription.designs_limit} návrhov
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <Card 
              key={plan.tier} 
              className={plan.popular ? "border-primary border-2 relative" : ""}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 rounded-bl-lg rounded-tr-lg">
                  <Sparkles className="h-4 w-4 inline mr-1" />
                  Najpopulárnejšie
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-3xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.designs} AI návrhov / mesiac</CardDescription>
                  </div>
                  {plan.tier === 'pro' && <Crown className="h-8 w-8 text-primary" />}
                </div>
                <div className="mt-4">
                  <span className="text-5xl font-bold">€{plan.price}</span>
                  <span className="text-muted-foreground">/mesiac</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleSubscribe(plan.tier as 'free' | 'pro')}
                  className="w-full"
                  size="lg"
                  variant={plan.popular ? "default" : "outline"}
                  disabled={currentSubscription?.tier === plan.tier}
                >
                  {currentSubscription?.tier === plan.tier ? "Aktívny plán" : `Aktivovať ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Services */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>AR Try-Before-Buy</CardTitle>
              <CardDescription>
                Pozrite si dekoráciu vo vašej miestnosti pomocou AR
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  €0.99 / preview
                </Badge>
                <Button variant="outline">Vyskúšať AR</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Design Konzultácie</CardTitle>
              <CardDescription>
                Video hovor s interiérovým dizajnérom
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  €29-€99
                </Badge>
                <Button variant="outline">Rezervovať</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HomeDecorSubscription;
