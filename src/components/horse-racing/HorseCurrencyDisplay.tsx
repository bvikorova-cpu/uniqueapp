import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Gem } from "lucide-react";
import { useHorseCurrency } from "@/hooks/useHorseRacing";

export const HorseCurrencyDisplay = () => {
  const { currency, isLoading } = useHorseCurrency();

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
          <Button variant="outline">
            <Coins className="mr-2 h-4 w-4" />
            Buy Coins
          </Button>
          <Button>
            <Gem className="mr-2 h-4 w-4" />
            Buy Gems
          </Button>
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
