import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Coins, Gem } from "lucide-react";
import { useHorseCurrency, usePurchaseCurrency } from "@/hooks/useHorseRacing";
import { useState } from "react";
import { toast } from "sonner";

export const HorseCurrencyDisplay = () => {
  const { currency, isLoading } = useHorseCurrency();
  const purchaseCurrency = usePurchaseCurrency();
  const [showBuyCoins, setShowBuyCoins] = useState(false);
  const [showBuyGems, setShowBuyGems] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  const handlePurchase = (packageType: string) => {
    if (!currency) {
      toast.error("Unable to load currency. Please refresh the page.");
      return;
    }
    setSelectedPackage(packageType);
    purchaseCurrency.mutate(packageType, {
      onSettled: () => {
        setSelectedPackage(null);
        setShowBuyCoins(false);
        setShowBuyGems(false);
      },
      onError: () => {
        toast.error("Purchase failed. Please try again.");
      }
    });
  };

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex gap-4 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Coins className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Coins</p>
              <p className="text-xl sm:text-2xl font-bold">{currency?.coins || 0}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Gem className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Gems</p>
              <p className="text-xl sm:text-2xl font-bold">{currency?.gems || 0}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={showBuyCoins} onOpenChange={setShowBuyCoins}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto text-sm">
                <Coins className="mr-2 h-4 w-4" />
                Buy Coins
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Buy Coins</DialogTitle>
                <DialogDescription>
                  Select a coin package for training and breeding
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start p-4"
                  onClick={() => handlePurchase("coins_100")}
                  disabled={purchaseCurrency.isPending}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    <span className="font-bold">
                      {selectedPackage === "coins_100" && purchaseCurrency.isPending ? "Processing..." : "100 Coins"}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">€1.99</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start p-4 border-primary"
                  onClick={() => handlePurchase("coins_500")}
                  disabled={purchaseCurrency.isPending}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    <span className="font-bold">
                      {selectedPackage === "coins_500" && purchaseCurrency.isPending ? "Processing..." : "500 Coins"}
                    </span>
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                      BONUS
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">€8.99</span>
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showBuyGems} onOpenChange={setShowBuyGems}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto text-sm">
                <Gem className="mr-2 h-4 w-4" />
                Buy Gems
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Buy Gems</DialogTitle>
                <DialogDescription>
                  Select a gem package for exclusive colors and options
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start p-4"
                  onClick={() => handlePurchase("gems_50")}
                  disabled={purchaseCurrency.isPending}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Gem className="h-5 w-5 text-primary" />
                    <span className="font-bold">
                      {selectedPackage === "gems_50" && purchaseCurrency.isPending ? "Processing..." : "50 Gems"}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">€4.99</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start p-4 border-primary"
                  onClick={() => handlePurchase("gems_200")}
                  disabled={purchaseCurrency.isPending}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Gem className="h-5 w-5 text-primary" />
                    <span className="font-bold">200 Gems</span>
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                      BONUS
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">€18.99</span>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Legal Notice:</strong> Virtual currency cannot be exchanged for real money. 
          All purchases are final and for entertainment purposes only.
        </p>
      </div>
    </Card>
  );
};
