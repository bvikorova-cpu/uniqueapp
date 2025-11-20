import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Coins, Gem, Gift } from "lucide-react";
import { useHorseCurrency, useClaimDailyReward, usePurchaseCurrency } from "@/hooks/useHorseRacing";
import { useState } from "react";

export const HorseCurrencyDisplay = () => {
  const { currency, isLoading } = useHorseCurrency();
  const claimReward = useClaimDailyReward();
  const purchaseCurrency = usePurchaseCurrency();
  const [showBuyCoins, setShowBuyCoins] = useState(false);
  const [showBuyGems, setShowBuyGems] = useState(false);

  const canClaimReward = () => {
    if (!currency?.last_daily_claim) return true;
    const lastClaim = new Date(currency.last_daily_claim);
    const now = new Date();
    const hoursSince = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);
    return hoursSince >= 24;
  };

  const getTimeUntilNextReward = () => {
    if (!currency?.last_daily_claim) return null;
    const lastClaim = new Date(currency.last_daily_claim);
    const now = new Date();
    const hoursSince = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);
    const hoursRemaining = Math.ceil(24 - hoursSince);
    return hoursRemaining > 0 ? hoursRemaining : 0;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-6">
          <div className="flex items-center gap-3">
            <Coins className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Coins</p>
              <p className="text-2xl font-bold">{currency?.coins || 0}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Gem className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Gems</p>
              <p className="text-2xl font-bold">{currency?.gems || 0}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => claimReward.mutate()}
            disabled={!canClaimReward() || claimReward.isPending}
          >
            <Gift className="mr-2 h-4 w-4" />
            {canClaimReward()
              ? "Denná odmena"
              : `Odmena o ${getTimeUntilNextReward()}h`}
          </Button>

          <Dialog open={showBuyCoins} onOpenChange={setShowBuyCoins}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Coins className="mr-2 h-4 w-4" />
                Kúpiť mince
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Kúpiť mince</DialogTitle>
                <DialogDescription>
                  Vyberte balíček mincí pre tréning a breeding
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start p-4"
                  onClick={() => {
                    purchaseCurrency.mutate("coins_100");
                    setShowBuyCoins(false);
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    <span className="font-bold">100 mincí</span>
                  </div>
                  <span className="text-sm text-muted-foreground">€1.99</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start p-4 border-primary"
                  onClick={() => {
                    purchaseCurrency.mutate("coins_500");
                    setShowBuyCoins(false);
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    <span className="font-bold">500 mincí</span>
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
              <Button>
                <Gem className="mr-2 h-4 w-4" />
                Kúpiť drahokamy
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Kúpiť drahokamy</DialogTitle>
                <DialogDescription>
                  Vyberte balíček drahokamov pre exkluzívne farby a možnosti
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start p-4"
                  onClick={() => {
                    purchaseCurrency.mutate("gems_50");
                    setShowBuyGems(false);
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Gem className="h-5 w-5 text-primary" />
                    <span className="font-bold">50 drahokamov</span>
                  </div>
                  <span className="text-sm text-muted-foreground">€4.99</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start p-4 border-primary"
                  onClick={() => {
                    purchaseCurrency.mutate("gems_200");
                    setShowBuyGems(false);
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Gem className="h-5 w-5 text-primary" />
                    <span className="font-bold">200 drahokamov</span>
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
