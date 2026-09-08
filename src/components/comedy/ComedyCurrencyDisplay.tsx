import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Sparkles } from "lucide-react";
import { useComedyCurrency } from "@/hooks/useComedy";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

/** Coin packages — paid exclusively with unified AI credits. */
const COIN_PACKAGES = [
  { coins: 100, credits: 5 },
  { coins: 250, credits: 11 },
  { coins: 500, credits: 20 },
] as const;

export const ComedyCurrencyDisplay = () => {
  const { currency, isLoading, refetch } = useComedyCurrency();
  const { totalBalance, refresh } = useAICredits();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<number | null>(null);

  const handleBuyCoins = async (coins: number, credits: number) => {
    if (totalBalance < credits) {
      toast({
        title: "Not enough AI credits",
        description: `You need ${credits} credits for ${coins} coins.`,
        variant: "destructive",
      });
      navigate("/ai-credits");
      return;
    }

    setBusy(coins);
    try {
      const { data, error } = await supabase.rpc("buy_comedy_coins", { _coins: coins });
      if (error) throw error;

      const result = data as { success?: boolean; error?: string } | null;
      if (!result?.success) {
        if (result?.error === "insufficient_credits") {
          toast({
            title: "Not enough AI credits",
            description: "Top up your credits and try again.",
            variant: "destructive",
          });
          navigate("/ai-credits");
          return;
        }
        throw new Error(result?.error || "Purchase failed");
      }

      toast({
        title: "Coins added",
        description: `${coins} comedy coins for ${credits} AI credits.`,
      });
      await Promise.all([refetch(), refresh()]);
      window.dispatchEvent(new Event("ai-credits-updated"));
    } catch (error) {
      console.error("Error buying comedy coins:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to buy coins",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <FloatingHowItWorks
        title={"Comedy Coins - How it works"}
        steps={[
          { title: "Check balance", desc: "See your comedy coins and AI credit balance." },
          { title: "Pick a package", desc: "Exchange AI credits for comedy coins (100, 250 or 500)." },
          { title: "Spend coins", desc: "Watch shows, vote in battles and send tips." },
          { title: "Earn coins", desc: "Perform shows, win battles and sell clips to earn more." },
        ]}
      />
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Coins className="h-10 w-10 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Comedy Coins</p>
              <p className="text-3xl font-bold">{currency?.coins || 0}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {COIN_PACKAGES.map((pkg) => (
              <Button
                key={pkg.coins}
                variant="outline"
                onClick={() => handleBuyCoins(pkg.coins, pkg.credits)}
                disabled={busy !== null}
                className="gap-1"
              >
                <Sparkles className="h-4 w-4" />
                {busy === pkg.coins
                  ? "Processing..."
                  : `${pkg.coins} Coins - ${pkg.credits} credits`}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t space-y-1">
          <p className="text-sm text-muted-foreground">
            💳 <strong>AI credits balance:</strong> {totalBalance}{" "}
            <button
              type="button"
              className="underline text-primary"
              onClick={() => navigate("/ai-credits")}
            >
              Top up
            </button>
          </p>
          <p className="text-sm text-muted-foreground">
            💰 <strong>Earn coins:</strong> Perform shows, win battles, sell clips
            <br />
            🎭 <strong>Spend coins:</strong> Watch shows, vote in battles, send tips
          </p>
        </div>
      </Card>
    </>
  );
};
