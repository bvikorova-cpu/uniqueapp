import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { showMonetagRewarded } from "@/lib/monetag";

const COOLDOWN_MS = 60_000;
const STORAGE_KEY = "lastAdRewardAt";
const XP_REWARD = 25;

/**
 * Rewarded-ad hook backed by Monetag (Vignette).
 * Flow: showMonetagRewarded() -> award_xp RPC -> 60s local cooldown.
 */
export function useRewardedAd() {
  const [isLoading, setIsLoading] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const qc = useQueryClient();
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    const update = () => {
      const last = Number(localStorage.getItem(STORAGE_KEY) || 0);
      const remaining = Math.max(0, COOLDOWN_MS - (Date.now() - last));
      setCooldownRemaining(remaining);
    };
    update();
    tickRef.current = window.setInterval(update, 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, []);

  const watchAd = useCallback(async () => {
    if (cooldownRemaining > 0) {
      toast.info(`Wait ${Math.ceil(cooldownRemaining / 1000)}s before next ad`);
      return;
    }
    setIsLoading(true);
    try {
      const shown = await showMonetagRewarded();
      if (!shown) {
        toast.error("Ad couldn't load. Try again in a moment.");
        return;
      }

      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) {
        toast.error("Sign in to earn XP from ads.");
        return;
      }

      const today = new Date().toISOString().slice(0, 10);
      const { error } = await supabase.rpc("award_xp", {
        _user_id: uid,
        _amount: XP_REWARD,
        _source: "rewarded_ad_view",
        _ref_id: `${today}:${Date.now()}`,
      });
      if (error) {
        toast.error("Couldn't credit XP. Please retry.");
        return;
      }

      localStorage.setItem(STORAGE_KEY, String(Date.now()));
      toast.success(`+${XP_REWARD} XP earned!`);
      qc.invalidateQueries({ queryKey: ["user-xp"] });
      qc.invalidateQueries({ queryKey: ["weekly-xp"] });
      qc.invalidateQueries({ queryKey: ["gamification"] });
    } catch (e) {
      console.error(e);
      toast.error("Ad reward failed");
    } finally {
      setIsLoading(false);
    }
  }, [cooldownRemaining, qc]);

  return { watchAd, isLoading, cooldownRemaining };
}
