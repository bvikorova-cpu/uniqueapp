import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";
import { useComedyCurrency } from "@/hooks/useComedy";

export const ComedyCurrencyDisplay = () => {
  const { currency, isLoading } = useComedyCurrency();

  const handleBuyCoins = async (amount: number, price: number) => {
    // This will be implemented with Stripe integration
    console.log(`Buy ${amount} coins for $${price}`);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Coins className="h-10 w-10 text-yellow-500" />
          <div>
            <p className="text-sm text-muted-foreground">Comedy Coins</p>
            <p className="text-3xl font-bold">{currency?.coins || 0}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleBuyCoins(500, 4.99)}
          >
            500 Coins - $4.99
          </Button>
          <Button onClick={() => handleBuyCoins(1200, 9.99)}>
            1200 Coins - $9.99
          </Button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          💰 <strong>Earn coins:</strong> Perform shows, win battles, sell clips
          <br />
          🎭 <strong>Spend coins:</strong> Watch shows, vote in battles, send tips
        </p>
      </div>
    </Card>
  );
};
