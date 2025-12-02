import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHandwritingCredits } from "@/hooks/useHandwritingCredits";
import { PenTool, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const HandwritingCreditsDisplay = () => {
  const { credits, isLoading, purchaseCredits } = useHandwritingCredits();
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchase = async (amount: number) => {
    setIsPurchasing(true);
    const url = await purchaseCredits(amount);
    if (url) {
      window.open(url, "_blank");
    }
    setIsPurchasing(false);
    setShowBuyDialog(false);
  };

  if (isLoading) return null;

  const packages = [
    { credits: 10, price: "€5", popular: false },
    { credits: 25, price: "€12", popular: true },
    { credits: 50, price: "€20", popular: false },
    { credits: 100, price: "€35", popular: false },
  ];

  return (
    <>
      <Card className="p-4 sm:p-6 bg-gradient-to-r from-purple-500/10 to-indigo-500/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <PenTool className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Analysis Credits</p>
              <p className="text-2xl sm:text-3xl font-bold">{credits?.credits_remaining || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Total purchased: {credits?.total_credits_purchased || 0}
              </p>
            </div>
          </div>

          <Button onClick={() => setShowBuyDialog(true)} className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            <span className="text-sm sm:text-base">Buy Credits</span>
          </Button>
        </div>
      </Card>

      <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Purchase Analysis Credits</DialogTitle>
            <DialogDescription>
              Choose a credit package to start analyzing handwriting samples
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {packages.map((pkg) => (
              <Card
                key={pkg.credits}
                className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                  pkg.popular ? "border-purple-500 border-2" : ""
                }`}
              >
                {pkg.popular && (
                  <div className="text-xs font-bold text-purple-500 mb-2">POPULAR</div>
                )}
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{pkg.credits}</div>
                  <div className="text-sm text-muted-foreground mb-4">Credits</div>
                  <div className="text-2xl font-bold text-purple-500 mb-4">{pkg.price}</div>
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
            ))}
          </div>

          <div className="mt-4 text-xs text-muted-foreground text-center">
            <p>• Personal Analysis: 5 credits</p>
            <p>• Professional Analysis: 10 credits</p>
            <p>• Relationship Analysis: 15 credits</p>
            <p>• Business Analysis: 20 credits</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
