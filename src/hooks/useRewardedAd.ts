import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { detectAdProvider, showRewardedAd } from "@/lib/ads/adProvider";

const COOLDOWN_MS = 60_000;
const STORAGE_KEY = "lastAdRewardAt";

export function useRewardedAd() {
  const [isLoading, setIsLoading] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const qc = useQueryClient();
  const tickRef = useRef<number | null>(null);

  // Tick cooldown every second
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
      const provider = detectAdProvider();

      // 1. Start session
      const { data: session, error: sErr } = await supabase.functions.invoke("start-ad-session", {
        body: { provider },
      });
      if (sErr || !session?.client_token) {
        if (sErr?.context?.status === 429 || session?.error === "cooldown") {
          toast.info("Please wait a moment before the next ad");
        } else {
          toast.error("Could not start ad");
        }
        return;
      }

      // 2. Show ad
      const watched = await showRewardedAd(provider);
      if (!watched) {
        toast.info("Ad not completed");
        return;
      }

      // 3. Claim
      const { data: claim, error: cErr } = await supabase.functions.invoke("claim-ad-reward", {
        body: { client_token: session.client_token },
      });
      if (cErr || !claim?.success) {
        toast.error(claim?.error === "cooldown" ? "Please wait before next ad" : "Could not claim reward");
        return;
      }

      localStorage.setItem(STORAGE_KEY, String(Date.now()));
      toast.success(`+${claim.xp_granted} XP earned!`);
      qc.invalidateQueries({ queryKey: ["user-xp"] });
      qc.invalidateQueries({ queryKey: ["weekly-xp"] });
    } catch (e) {
      console.error(e);
      toast.error("Ad reward failed");
    } finally {
      setIsLoading(false);
    }
  }, [cooldownRemaining, qc]);

  return { watchAd, isLoading, cooldownRemaining };
}
