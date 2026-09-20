import { useCallback, useState } from "react";
import { toast } from "sonner";
import { showMonetagRewarded } from "@/lib/monetag";

/**
 * Isolated ad gate for Marketplace flows (Bazaar, Coupons, Auctions, Skills).
 * The user must watch one sponsored ad instead of paying credits.
 * Returns true only when the ad was actually served/viewed.
 */
export function useMarketplaceAdGate() {
  const [adPlaying, setAdPlaying] = useState(false);

  const watchAdToContinue = useCallback(async (label = "continue"): Promise<boolean> => {
    setAdPlaying(true);
    try {
      toast.info(`Loading a short sponsored ad to ${label}…`);
      const shown = await showMonetagRewarded();
      if (!shown) {
        toast.error("The ad could not be shown. Please try again in a moment.");
        return false;
      }
      return true;
    } catch {
      toast.error("The ad could not be shown. Please try again in a moment.");
      return false;
    } finally {
      setAdPlaying(false);
    }
  }, []);

  return { watchAdToContinue, adPlaying };
}
