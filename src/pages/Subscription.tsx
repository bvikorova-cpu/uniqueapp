import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, Crown, Sparkles, Zap } from "lucide-react";

const Subscription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [currentTier, setCurrentTier] = useState<string>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      setUser(user);

      // Check current subscription
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (sub) {
        setCurrentTier(sub.tier);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tier: string, price: number) => {
    if (!user) return;

    try {
      // TODO: Integrate with Tatra Banka payment gateway
      toast({
        title: "Platba pripravená",
        description: "Tu bude integrácia s platobnou bránou Tatra banky",
      });

      const expiresAt = tier !== 'free' 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          tier: tier as 'free' | 'basic' | 'premium' | 'business',
          price,
          expires_at: expiresAt,
          status: 'active',
        });

      if (error) throw error;

      // Create transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'subscription',
          amount: price,
          commission_rate: 0,
          commission_amount: price,
          status: 'completed',
        });

      toast({
        title: "Úspech!",
        description: `Predplatné ${tier.toUpperCase()} bolo aktivované`,
      });

      setCurrentTier(tier);
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa aktivovať predplatné",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Načítavam...</div>;
  }

  const plans = [
    {
      tier: 'free',
      name: 'Free',
      price: 0,
      icon: Sparkles,
      features: [
        '5 inzerátov v Bazári/mesiac',
        '3 aukcie/mesiac',
        'Základné funkcie',
        '5% provízia z predaja',
        'Obmedzené AI funkcie'
      ],
      limitations: true,
    },
    {
      tier: 'basic',
      name: 'Basic',
      price: 5,
      icon: Check,
      popular: false,
      features: [
        '10 inzerátov v Bazári/mesiac',
        '10 aukcií/mesiac',
        'Všetky základné funkcie',
        '3% provízia z predaja (do 100€)',
        '20 AI generácií/mesiac',
        'Podpora emailom'
      ],
    },
    {
      tier: 'premium',
      name: 'Premium',
      price: 15,
      icon: Crown,
      popular: true,
      features: [
        'Neobmedzené inzeráty',
        'Neobmedzené aukcie',
        '0% provízia z predaja',
        '50 AI generácií/mesiac',
        'Featured listings (3/mesiac)',
        'Prioritná podpora',
        'Analytics a štatistiky'
      ],
    },
    {
      tier: 'business',
      name: 'Business',
      price: 50,
      icon: Zap,
      popular: false,
      features: [
        'Všetko z Premium',
        '0% provízie navždy',
        'Neobmedzené AI funkcie',
        'Neobmedzené featured listings',
        'Vlastný branding',
        'API prístup',
        'Dedikovaná podpora',
        'Vlastný account manager'
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Vyberte si{" "}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Predplatné
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Získajte viac z Megatalent platformy
          </p>
          {currentTier !== 'free' && (
            <Badge className="mt-4" variant="default">
              Aktuálne: {currentTier.toUpperCase()}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = currentTier === plan.tier;
            
            return (
              <Card 
                key={plan.tier}
                className={`relative ${plan.popular ? 'ring-2 ring-primary shadow-lg scale-105' : ''} ${isCurrent ? 'border-green-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Najpopulárnejšie
                    </Badge>
                  </div>
                )}
                
                {isCurrent && (
                  <div className="absolute -top-4 right-4">
                    <Badge className="bg-green-500 text-white">
                      Aktuálne
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${plan.popular ? 'bg-primary/10' : 'bg-muted'}`}>
                      <Icon className={`h-8 w-8 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}€</span>
                    {plan.price > 0 && <span className="text-muted-foreground">/mesiac</span>}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    disabled={isCurrent}
                    onClick={() => handleSubscribe(plan.tier, plan.price)}
                  >
                    {isCurrent ? 'Aktuálny plán' : plan.tier === 'free' ? 'Zostať Free' : 'Vybrať plán'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Všetky ceny sú uvedené v EUR. Predplatné je mesačné a môže byť kedykoľvek zrušené.</p>
          <p className="mt-2">Provízie sa účtujú len pri úspešnom predaji v Aukciách a Bazári.</p>
        </div>
      </div>
    </div>
  );
};

export default Subscription;