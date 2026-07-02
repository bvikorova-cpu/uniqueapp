import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePastLifeCredits } from "@/hooks/usePastLifeCredits";
import { Clock, Plus, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import {
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const PastLifeCreditsDisplay = () => {
  const { credits, isLoading, purchaseCredits } = usePastLifeCredits();
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchase = async (amount: number) => {
    setIsPurchasing(true);
    const url = await purchaseCredits(amount);
    if (url) window.open(url, "_blank");
    setIsPurchasing(false);
    setShowBuyDialog(false);
  };

  if (isLoading) return null;

  const packages = [
    { credits: 10, price: "€5", popular: false, icon: Clock },
    { credits: 25, price: "€12", popular: true, icon: Sparkles },
    { credits: 50, price: "€22", popular: false, icon: Zap },
    { credits: 100, price: "€40", popular: false, icon: Zap },
  ];

  return (
    <>
      <FloatingHowItWorks
        title='Past Life Credits Display'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Past Life Credits Display panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <>
      <Card className="overflow-hidden bg-card/80 backdrop-blur-xl border-border/50">
        <div className="h-1.5 bg-gradient-to-r from-primary to-accent" />
        <div className="p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Reading Credits</p>
                <p className="text-3xl sm:text-4xl font-black">{credits?.credits_remaining || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total purchased: {credits?.total_credits_purchased || 0}
                </p>
              </div>
            </div>
            <Button onClick={() => setShowBuyDialog(true)} className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Buy Credits
            </Button>
          </div>

          {/* Credit costs */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { label: "Basic Reading", cost: 5, icon: "📜" },
              { label: "Full Reading", cost: 15, icon: "✨" },
              { label: "Soul Mate", cost: 20, icon: "💕" },
            ].map((item) => (
              <div key={item.label} className="text-center p-3 rounded-xl bg-muted/20 border border-border/30">
                <span className="text-lg">{item.icon}</span>
                <p className="text-xs font-medium mt-1">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.cost} credits</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="font-black">Purchase Reading Credits</DialogTitle>
            <DialogDescription>
              Choose a credit package to unlock your past life mysteries
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {packages.map((pkg, i) => (
              <motion.div
                key={pkg.credits}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg bg-card/80 backdrop-blur-xl ${
                    pkg.popular ? "border-primary border-2 shadow-lg shadow-primary/10" : "border-border/50"
                  }`}
                >
                  {pkg.popular && (
                    <Badge className="mb-2 bg-primary/10 text-primary border-primary/20 text-[10px]">
                      POPULAR
                    </Badge>
                  )}
                  <div className="text-center">
                    <div className="text-4xl font-black mb-1">{pkg.credits}</div>
                    <div className="text-sm text-muted-foreground mb-3">Credits</div>
                    <div className="text-2xl font-black text-primary mb-4">{pkg.price}</div>
                    <Button
                      onClick={() => handlePurchase(pkg.credits)}
                      disabled={isPurchasing}
                      className="w-full"
                      variant={pkg.popular ? "default" : "outline"}
                    >
                      Purchase
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
    </>
  );
};
