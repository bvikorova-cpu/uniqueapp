import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/** 1 AI credit buys this many Battle Coins (one-way only). */
export const COINS_PER_CREDIT = 100;
/** Duel entry fee, paid exclusively in Battle Coins. */
export const BATTLE_ENTRY_COINS = 100;
/** Prize paid to the winner of a duel. */
export const BATTLE_PRIZE_COINS = 160;

export const BATTLE_COINS_UPDATED = "battle-coins-updated";

export function useBattleCoins() {
  const { toast } = useToast();
  const [coins, setCoins] = useState(0);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }
    const [{ data: wallet }, { data: credit }] = await Promise.all([
      supabase.from("battle_coins").select("balance").eq("user_id", session.user.id).maybeSingle(),
      supabase.from("ai_credits").select("credits_remaining").eq("user_id", session.user.id).maybeSingle(),
    ]);
    setCoins(wallet?.balance ?? 0);
    setCredits(credit?.credits_remaining ?? 0);
    setLoading(false);
  }, []);

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

  /** Converts AI credits into Battle Coins. There is no way back — coins never become credits. */
  const exchange = useCallback(async (creditAmount: number) => {
    setBusy(true);
    const { data, error } = await supabase.rpc("exchange_credits_for_battle_coins", { _credits: creditAmount });
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
    toast({ title: "Battle Coins added", description: `You received ${received.toLocaleString()} coins.` });
    window.dispatchEvent(new Event("ai-credits-updated"));
    window.dispatchEvent(new Event(BATTLE_COINS_UPDATED));
    await refresh();
    return true;
  }, [credits, refresh, toast]);

  return { coins, credits, loading, busy, refresh, exchange };
}
