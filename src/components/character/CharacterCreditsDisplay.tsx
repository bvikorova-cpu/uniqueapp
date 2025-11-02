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
    return <div className="text-white">Loading credits...</div>;
  }

  return (
    <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Coins className="h-8 w-8 text-yellow-400" />
          <div>
            <p className="text-white/80 text-sm">Character Credits</p>
            <p className="text-3xl font-bold text-white">
              {credits?.credits_remaining || 0}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => handlePurchase(50)}
            variant="outline"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          >
            <Plus className="mr-2 h-4 w-4" />
            50 Credits - $9.99
          </Button>
          <Button
            onClick={() => handlePurchase(200)}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            200 Credits - $29.99
          </Button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-white/60 text-xs">
          💡 Basic Character: 5 credits • Premium Character: 15 credits • Quick Battle: 2 credits
        </p>
      </div>
    </Card>
  );
};
