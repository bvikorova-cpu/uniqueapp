import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAICredits } from "@/hooks/useAICredits";
import { Sparkles, Zap, Star, Package } from "lucide-react";

const AICreditsStore = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { credits, purchaseCredits } = useAICredits();
  const [loading, setLoading] = useState(false);

  const creditPackages = [
    {
      name: "Starter",
      credits: 10,
      price: 5,
      icon: Sparkles,
      popular: false,
      description: "Skúste AI funkcie",
      perCredit: 0.50,
    },
    {
      name: "Basic",
      credits: 25,
      price: 10,
      icon: Star,
      popular: true,
      description: "Najobľúbenejší balíček",
      perCredit: 0.40,
      savings: "20% úspora",
    },
    {
      name: "Pro",
      credits: 60,
      price: 20,
      icon: Zap,
      popular: false,
      description: "Pre náročných užívateľov",
      perCredit: 0.33,
      savings: "34% úspora",
    },
    {
      name: "Ultimate",
      credits: 150,
      price: 40,
      icon: Package,
      popular: false,
      description: "Najlepšia hodnota",
      perCredit: 0.27,
      savings: "46% úspora",
    },
  ];

  const handlePurchase = async (pkg: typeof creditPackages[0]) => {
    setLoading(true);
    try {
      toast({
        title: "Platba pripravená",
        description: "Tu bude integrácia s platobnou bránou Tatra banky",
      });

      const success = await purchaseCredits(pkg.credits, pkg.price);

      if (success) {
        toast({
          title: "Úspech!",
          description: `Zakúpili ste ${pkg.credits} AI kreditov`,
        });
      } else {
        throw new Error("Failed to purchase credits");
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa zakúpiť kredity",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="default">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Kredity
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Nakúpte{" "}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              AI Kredity
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-6">
            Používajte AI funkcie kedykoľvek potrebujete
          </p>

          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <div>
                  <span className="text-3xl font-bold">{credits.credits_remaining}</span>
                  <span className="text-muted-foreground ml-2">dostupných kreditov</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
          {creditPackages.map((pkg) => {
            const Icon = pkg.icon;
            
            return (
              <Card 
                key={pkg.name}
                className={`relative ${pkg.popular ? 'ring-2 ring-primary shadow-lg scale-105' : ''}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Najpopulárnejšie
                    </Badge>
                  </div>
                )}
                
                {pkg.savings && (
                  <div className="absolute -top-4 right-4">
                    <Badge className="bg-green-500 text-white">
                      {pkg.savings}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${pkg.popular ? 'bg-primary/10' : 'bg-muted'}`}>
                      <Icon className={`h-8 w-8 ${pkg.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{pkg.price}€</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {pkg.credits} kreditov ({pkg.perCredit}€ / kredit)
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{pkg.credits} AI generácií</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>Platnosť 12 mesiacov</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>Použiteľné na všetky AI funkcie</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    variant={pkg.popular ? 'default' : 'outline'}
                    disabled={loading}
                    onClick={() => handlePurchase(pkg)}
                  >
                    Kúpiť teraz
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Ako fungujú AI kredity?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">🎨 Generovanie obrázkov</h4>
                  <p className="text-sm text-muted-foreground">
                    1 kredit = 1 AI generovaný obrázok (AI Generation, Avatar)
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">✨ AI efekty</h4>
                  <p className="text-sm text-muted-foreground">
                    1 kredit = 1 aplikovaný AI efekt na fotku
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">📚 AI kurzy</h4>
                  <p className="text-sm text-muted-foreground">
                    5 kreditov = 1 personalizovaný AI kurz
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">⏰ Platnosť</h4>
                  <p className="text-sm text-muted-foreground">
                    Kredity neexpirujú 12 mesiacov od nákupu
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Všetky ceny sú uvedené v EUR. Kredity môžu byť použité na akékoľvek AI funkcie na platforme.</p>
          <p className="mt-2">
            Premium a Business predplatné už zahŕňajú kredity zadarmo.{" "}
            <button 
              onClick={() => navigate('/subscription')}
              className="text-primary hover:underline"
            >
              Pozrite si predplatné
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AICreditsStore;