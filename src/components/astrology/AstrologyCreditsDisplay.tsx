import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAstrologyCredits } from '@/hooks/useAstrologyCredits';
import { Sparkles, ShoppingCart, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const CREDIT_PACKAGES = [
  { id: "10", credits: 10, price: "€5", popular: false },
  { id: "25", credits: 25, price: "€12.50", popular: true },
  { id: "50", credits: 50, price: "€25", popular: false },
  { id: "100", credits: 100, price: "€50", popular: false, bestValue: true },
];

export const AstrologyCreditsDisplay = () => {
  const { credits, isLoading } = useAstrologyCredits();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handlePurchase = async (packageId: string) => {
    setPurchasing(packageId);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { creditType: 'astrology', credits: Number(packageId) },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout",
        variant: "destructive",
      });
    } finally {
      setPurchasing(null);
    }
  };

  if (isLoading) return null;

  return (
    <>
      <FloatingHowItWorks
        title='Astrology Credits Display'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Astrology Credits Display panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <Card className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <div>
            <p className="text-sm text-muted-foreground">Astrology Credits</p>
            <p className="text-2xl font-bold">{credits?.credits_remaining || 0}</p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <ShoppingCart className="h-4 w-4" />
              Buy Credits
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-xl">Purchase Astrology Credits</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              {CREDIT_PACKAGES.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    pkg.popular ? 'border-purple-500 border-2' : ''
                  } ${pkg.bestValue ? 'border-green-500 border-2' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{pkg.credits} Credits</span>
                        {pkg.popular && (
                          <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded">Popular</span>
                        )}
                        {pkg.bestValue && (
                          <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">Best Value</span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">{pkg.price}</p>
                    </div>
                    <Button
                      onClick={() => handlePurchase(pkg.id)}
                      disabled={purchasing !== null}
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      {purchasing === pkg.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Buy"
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Secure payment via Stripe. Credits are added immediately after purchase.
            </p>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
    </>
  );
};
