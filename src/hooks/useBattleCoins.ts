import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/** 1 AI credit buys this many Battle Coins (one-way only). */
export const COINS_PER_CREDIT = 100;
/** Duel entry fee, paid exclusively in Battle Coins. */
export const BATTLE_ENTRY_COINS = 100;
/** Prize paid to the winner of a duel. */
export const BATTLE_PRIZE_COINS = 160; // 80% of a 2-player 100-coin pot

export const BATTLE_COINS_UPDATED = "battle-coins-updated";

/** Each module keeps its own isolated coin wallet — coins never move between sections. */
export type BattleModule = "kitchenstars" | "reel_battles" | "megatalent";

export const BATTLE_MODULE_LABELS: Record<BattleModule, string> = {
  kitchenstars: "KitchenStars",
  reel_battles: "Clip Battles",
  megatalent: "Megatalent",
};

export function useBattleCoins(module: BattleModule = "kitchenstars") {
  const { toast } = useToast();
  const [coins, setCoins] = useState(0);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }
    const [{ data: wallet }, { data: credit }] = await Promise.all([
      (supabase as any)
        .from("battle_coins")
        .select("balance")
        .eq("user_id", session.user.id)
        .eq("module", module)
        .maybeSingle(),
      supabase.from("ai_credits").select("credits_remaining").eq("user_id", session.user.id).maybeSingle(),
    ]);
    setCoins(wallet?.balance ?? 0);
    setCredits(credit?.credits_remaining ?? 0);
    setLoading(false);
  }, [module]);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener(BATTLE_COINS_UPDATED, handler);
    window.addEventListener("ai-credits-updated", handler);
    return () => {
      window.removeEventListener(BATTLE_COINS_UPDATED, handler);
      window.removeEventListener("ai-credits-updated", handler);
    };
  }, [refresh]);

  /**
   * Converts AI credits into Battle Coins for THIS module only.
   * There is no way back — coins never become credits and never cross into another section.
   */
  const exchange = useCallback(async (creditAmount: number) => {
    setBusy(true);
    const { data, error } = await (supabase as any).rpc("exchange_credits_for_battle_coins", {
      _credits: creditAmount,
      _module: module,
    });
    setBusy(false);
    if (error) {
      const insufficient = error.message.includes("INSUFFICIENT_CREDITS");
      toast({
        title: insufficient ? "Not enough credits" : "Exchange failed",
        description: insufficient
          ? `You need ${creditAmount} AI credits — you have ${credits}.`
          : error.message,
        variant: "destructive",
      });
      return false;
    }
    const received = (data as any)?.coins_received ?? creditAmount * COINS_PER_CREDIT;
    toast({
      title: "Battle Coins added",
      description: `You received ${received.toLocaleString()} coins for ${BATTLE_MODULE_LABELS[module]}.`,
    });
    window.dispatchEvent(new Event("ai-credits-updated"));
    window.dispatchEvent(new Event(BATTLE_COINS_UPDATED));
    await refresh();
    return true;
  }, [credits, module, refresh, toast]);

  return { coins, credits, loading, busy, refresh, exchange, module };
}
