import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Coins, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getUserFriendlyErrorMessage } from '@/utils/errorHandler';

interface BuyCreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CREDIT_PACKAGES = [
  {
    credits: 100,
    price: '€2.99',
    priceId: 'price_1SSd4iGaXSfGtYFtv9AoBSDD',
    popular: false,
  },
  {
    credits: 500,
    price: '€9.99',
    priceId: 'price_1SSd4jGaXSfGtYFtrF2pSCnX',
    popular: true,
    savings: 'Save 33%',
  },
  {
    credits: 2000,
    price: '€29.99',
    priceId: 'price_1SSd4kGaXSfGtYFtNZwDEepN',
    popular: false,
    savings: 'Save 50%',
  },
];

export const BuyCreditsDialog = ({ open, onOpenChange }: BuyCreditsDialogProps) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (priceId: string) => {
    setLoading(priceId);
    try {
      const { data, error } = await supabase.functions.invoke('create-brain-duel-payment', {
        body: { priceId },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success('Redirected to payment');
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error(getUserFriendlyErrorMessage(error, 'Failed to create payment'));
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Coins className="h-6 w-6 text-primary" />
            Buy Credits
          </DialogTitle>
          <DialogDescription>
            Choose a credit package for fun on BrainDuel. Credits are for entertainment only.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          {CREDIT_PACKAGES.map((pkg) => (
            <Card
              key={pkg.priceId}
              className={`p-6 relative ${
                pkg.popular ? 'border-primary/50 ring-2 ring-primary/20' : ''
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-bold">
                  MOST POPULAR
                </div>
              )}
              
              <div className="text-center space-y-4">
                <div>
                  <p className="text-4xl font-bold text-primary">{pkg.credits}</p>
                  <p className="text-sm text-muted-foreground">credits</p>
                </div>

                <div>
                  <p className="text-3xl font-bold">{pkg.price}</p>
                  {pkg.savings && (
                    <p className="text-sm text-green-500 font-medium">{pkg.savings}</p>
                  )}
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Virtual credits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Never expires</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Instant delivery</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => handlePurchase(pkg.priceId)}
                  disabled={loading !== null}
                  variant={pkg.popular ? 'default' : 'outline'}
                >
                  {loading === pkg.priceId ? (
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
          ))}
        </div>

        <div className="text-xs text-muted-foreground text-center mt-4">
          ℹ️ Credits are virtual currency for entertainment only and have no real monetary value. 
          They cannot be exchanged for money.
        </div>
      </DialogContent>
    </Dialog>
  );
};
