import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Plus } from "lucide-react";
import { useCharacterCredits } from "@/hooks/useCharacterCredits";
import { toast } from "sonner";

export const CharacterCreditsDisplay = () => {
  const { credits, isLoading, purchaseCredits } = useCharacterCredits();

  const handlePurchase = async (amount: number) => {
    const url = await purchaseCredits(amount);
    if (url) {
      window.location.href = url;
    }
  };

  if (isLoading) {
    return <div>Loading credits...</div>;
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Coins className="h-8 w-8 text-yellow-500" />
          <div>
            <p className="text-muted-foreground text-sm">Character Credits</p>
            <p className="text-3xl font-bold">
              {credits?.credits_remaining || 0}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => handlePurchase(50)}
            variant="outline"
            className="w-full sm:w-auto text-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            50 Credits - €9.99
          </Button>
          <Button
            variant="outline"
            onClick={() => console.log("Purchase 200 credits")}
            className="w-full sm:w-auto text-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            200 Credits - €29.99
          </Button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <p className="text-sm">
          💡 Basic Character: 5 credits • Premium Character: 15 credits • Quick Battle: 2 credits
        </p>
      </div>
    </Card>
  );
};
