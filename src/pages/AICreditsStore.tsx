import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAICredits } from "@/hooks/useAICredits";
import { Sparkles, Zap, Star, Package, ExternalLink } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AICreditsStore = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { credits, purchaseCredits } = useAICredits();
  const [loading, setLoading] = useState(false);
  const [stripeUrl, setStripeUrl] = useState<string | null>(null);

  const creditPackages = [
    {
      name: "Starter",
      credits: 10,
      price: 5,
      icon: Sparkles,
      popular: false,
      description: "Try AI features",
      perCredit: 0.50,
    },
    {
      name: "Basic",
      credits: 25,
      price: 10,
      icon: Star,
      popular: true,
      description: "Most popular package",
      perCredit: 0.40,
      savings: "20% savings",
    },
    {
      name: "Pro",
      credits: 60,
      price: 20,
      icon: Zap,
      popular: false,
      description: "For demanding users",
      perCredit: 0.33,
      savings: "34% savings",
    },
    {
      name: "Ultimate",
      credits: 150,
      price: 40,
      icon: Package,
      popular: false,
      description: "Best value",
      perCredit: 0.27,
      savings: "46% savings",
    },
  ];

  const handlePurchase = async (pkg: typeof creditPackages[0]) => {
    try {
      console.log('Handle purchase clicked:', pkg);
      setLoading(true);
      
      const url = await purchaseCredits(pkg.credits, pkg.price);

      if (url) {
        console.log('Got Stripe URL:', url);
        setLoading(false);
        // Show the URL in a dialog so user can copy/click it
        setStripeUrl(url);
      } else {
        throw new Error("Failed to get payment URL");
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      setLoading(false);
      toast({
        title: "Chyba",
        description: error?.message || "Nepodarilo sa otvoriť platobný systém. Skúste znova.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <AlertDialog open={!!stripeUrl} onOpenChange={() => setStripeUrl(null)}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Platobný link pripravený
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 text-left">
              <p>Použite tento link na dokončenie platby cez Stripe:</p>
              <div className="bg-muted p-3 rounded-md break-all text-xs font-mono">
                {stripeUrl}
              </div>
              <p className="text-xs text-muted-foreground">
                Tip: Môžete si link skopírovať a otvoriť v akomkoľvek prehliadači
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col gap-2">
            <Button
              onClick={() => {
                if (stripeUrl) {
                  window.open(stripeUrl, '_blank');
                }
              }}
              className="w-full gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Otvoriť Stripe Platbu
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (stripeUrl) {
                  navigator.clipboard.writeText(stripeUrl);
                  toast({
                    title: "Skopírované",
                    description: "Link bol skopírovaný do schránky",
                  });
                }
              }}
              className="w-full"
            >
              Skopírovať link
            </Button>
            <Button
              variant="ghost"
              onClick={() => setStripeUrl(null)}
              className="w-full"
            >
              Zavrieť
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {loading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="p-8 text-center">
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold mb-2">Pripravujem platbu</h3>
            <p className="text-muted-foreground">Počkajte prosím...</p>
          </Card>
        </div>
      )}
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="default">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Credits
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Buy{" "}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              AI Credits
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-6">
            Use AI features whenever you need them
          </p>

          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <div>
                  <span className="text-3xl font-bold">{credits.credits_remaining}</span>
                  <span className="text-muted-foreground ml-2">available credits</span>
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
                      Most Popular
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
                    {pkg.credits} credits ({pkg.perCredit}€ / credit)
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{pkg.credits} AI generations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>Valid for 12 months</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>Usable for all AI features</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    variant={pkg.popular ? 'default' : 'outline'}
                    disabled={loading}
                    onClick={() => handlePurchase(pkg)}
                  >
                    Buy Now
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>How do AI credits work?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">🎨 Image Generation</h4>
                  <p className="text-sm text-muted-foreground">
                    1 credit = 1 AI generated image (AI Generation, Avatar)
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">✨ AI Effects</h4>
                  <p className="text-sm text-muted-foreground">
                    1 credit = 1 AI effect applied to photo
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">📚 AI Courses</h4>
                  <p className="text-sm text-muted-foreground">
                    5 credits = 1 personalized AI course
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">⏰ Validity</h4>
                  <p className="text-sm text-muted-foreground">
                    Credits do not expire for 12 months from purchase
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>All prices are in EUR. Credits can be used for any AI features on the platform.</p>
        </div>
      </div>
    </div>
  );
};

export default AICreditsStore;