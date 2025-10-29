import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, TrendingUp, Crown } from "lucide-react";

interface BuyCreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const creditPacks = [
  {
    name: "Starter Pack",
    credits: 10,
    price: 5,
    description: "Perfect for trying out",
    icon: Sparkles,
    popular: false
  },
  {
    name: "Basic Pack",
    credits: 25,
    price: 10,
    description: "Best value!",
    icon: TrendingUp,
    popular: true
  },
  {
    name: "Pro Pack",
    credits: 60,
    price: 20,
    description: "For power users",
    icon: Crown,
    popular: false
  },
  {
    name: "Ultimate Pack",
    credits: 150,
    price: 40,
    description: "For serious collectors",
    icon: Crown,
    popular: false
  }
];

export default function BuyCreditsDialog({ open, onOpenChange }: BuyCreditsDialogProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  // Stripe Payment Links - reliable alternative to dynamic checkout sessions
  const paymentLinks: Record<number, string> = {
    10: "https://buy.stripe.com/test_6oU14neszfs82qAcv9e3e00", // Starter Pack
    // Add other payment links in Stripe Dashboard for:
    // 25, 60, 150 credit packs
  };

  const handlePurchase = (credits: number) => {
    try {
      setLoading(credits.toString());
      
      const paymentLink = paymentLinks[credits];
      
      if (!paymentLink) {
        toast({
          title: "Platba zatiaľ nedostupná",
          description: "Tento balík sa práve pripravuje. Skúste Starter Pack (10 kreditov).",
          variant: "destructive",
        });
        setLoading(null);
        return;
      }

      toast({
        title: "Presmerovanie na Stripe",
        description: "Platobné okno sa otvorí v novej karte...",
      });
      
      // Direct redirect to Stripe Payment Link
      setTimeout(() => {
        window.location.href = paymentLink;
      }, 500);
      
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast({
        title: "Chyba pri platbe",
        description: error.message || "Vyskytla sa chyba",
        variant: "destructive",
      });
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Buy Collectibles Credits</DialogTitle>
          <DialogDescription>
            Choose a credit pack to generate collectibles and open mystery boxes
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {creditPacks.map((pack) => {
            const Icon = pack.icon;
            return (
              <Card 
                key={pack.credits} 
                className={`p-6 relative ${pack.popular ? 'border-primary shadow-lg' : ''}`}
              >
                {pack.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                
                <div className="flex flex-col items-center text-center space-y-4">
                  <Icon className={`h-12 w-12 ${pack.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                  
                  <div>
                    <h3 className="text-xl font-bold">{pack.name}</h3>
                    <p className="text-sm text-muted-foreground">{pack.description}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="text-3xl font-bold">€{pack.price}</div>
                    <div className="text-lg text-muted-foreground">
                      {pack.credits} credits
                    </div>
                    <div className="text-xs text-muted-foreground">
                      €{(pack.price / pack.credits).toFixed(2)} per credit
                    </div>
                  </div>

                  <Button 
                    onClick={() => handlePurchase(pack.credits)}
                    disabled={loading !== null}
                    className="w-full"
                    variant={pack.popular ? "default" : "outline"}
                  >
                    {loading === pack.credits.toString() ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Buy Now'
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Secure payment powered by Stripe. Credits never expire.
        </p>
      </DialogContent>
    </Dialog>
  );
}
