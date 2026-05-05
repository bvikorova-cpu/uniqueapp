import { useQuery } from "@tanstack/react-query";
import { Coins, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const LOW_THRESHOLD = 10;

interface GlamourCoinsBadgeProps {
  onBuyClick: () => void;
}

export const GlamourCoinsBadge = ({ onBuyClick }: GlamourCoinsBadgeProps) => {
  const { data: balance, isLoading } = useQuery({
    queryKey: ["glamour-coins"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;
      const { data } = await supabase
        .from("glamour_coins")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();
      return data?.balance ?? 0;
    },
    refetchInterval: 15000,
  });

  const coins = balance ?? 0;
  const isLow = !isLoading && coins < LOW_THRESHOLD;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onBuyClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md transition-all hover:scale-105 ${
          isLow
            ? "bg-destructive/10 border-destructive/40 text-destructive animate-pulse"
            : "bg-gradient-to-r from-yellow-500/15 to-pink-500/15 border-pink-500/30 text-foreground"
        }`}
        aria-label={`Glamour coins balance: ${coins}`}
      >
        <Coins className={`h-4 w-4 ${isLow ? "text-destructive" : "text-yellow-500"}`} />
        <span className="font-bold tabular-nums">
          {isLoading ? "…" : coins}
        </span>
        <span className="text-xs opacity-70">coins</span>
      </button>
      {isLow && (
        <Button
          size="sm"
          onClick={onBuyClick}
          className="bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 text-white shadow-md"
        >
          <Plus className="h-3 w-3 mr-1" />
          Buy coins
        </Button>
      )}
    </div>
  );
};
