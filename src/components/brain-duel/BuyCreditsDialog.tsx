import { useState } from 'react';
import { Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Check, Loader2, Sparkles, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getUserFriendlyErrorMessage } from '@/utils/errorHandler';
import { motion } from 'framer-motion';

interface BuyCreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CREDIT_PACKAGES = [
  { credits: 100,
    price: '€2.99',
    priceId: 'price_1SSd4iGaXSfGtYFtv9AoBSDD',
    popular: false,
    icon: '🧠' },
  { credits: 500,
    price: '€9.99',
    priceId: 'price_1SSd4jGaXSfGtYFtrF2pSCnX',
    popular: true,
    savings: 'Save 33%',
    icon: '⚡' },
  { credits: 2000,
    price: '€29.99',
    priceId: 'price_1SSd4kGaXSfGtYFtNZwDEepN',
    popular: false,
    savings: 'Save 50%',
    icon: '👑' },
];

export const BuyCreditsDialog = ({ open, onOpenChange }: BuyCreditsDialogProps) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (priceId: string) => {
    setLoading(priceId);
    try {
      const { data, error } = await supabase.functions.invoke('create-brain-duel-payment', {
        body: { priceId } });

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
      <DialogContent className="max-w-4xl backdrop-blur-xl bg-card/95">
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
          {CREDIT_PACKAGES.map((pkg, i) => (
            <motion.div
              key={pkg.priceId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className={`p-6 relative backdrop-blur-xl bg-card/80 transition-all hover:shadow-lg ${
                  pkg.popular ? 'border-primary/50 ring-2 ring-primary/20 shadow-primary/10' : 'border-primary/10'
                }`}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground shadow-md">
                    <Sparkles className="h-3 w-3 mr-1" /> MOST POPULAR
                  </Badge>
                )}
                
                <div className="text-center space-y-4">
                  <div className="text-4xl mb-2">{pkg.icon}</div>
                  <div>
                    <p className="text-4xl font-black text-primary">{pkg.credits}</p>
                    <p className="text-sm text-muted-foreground">credits</p>
                  </div>

                  <div>
                    <p className="text-3xl font-bold">{pkg.price}</p>
                    {pkg.savings && (
                      <Badge variant="outline" className="text-green-500 border-green-500/30 mt-1">
                        <Zap className="h-3 w-3 mr-1" /> {pkg.savings}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    {['Virtual credits', 'Never expires', 'Instant delivery'].map(text => (
                      <div key={text} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span>{text}</span>
                      </div>
                    ))}
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
            </motion.div>
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