import { showMonetagRewarded, MONETAG_ZONES, loadMonetagZone } from "@/lib/monetag";
import { toast } from "sonner";

/**
 * Show a Monetag rewarded ad as a pre-roll BEFORE launching a game.
 * - Never blocks the game on ad failure (UX > monetization).
 * - Returns true if ad actually played (informational only).
 */
export async function playPreRoll(): Promise<boolean> {
  try {
    loadMonetagZone(MONETAG_ZONES.REWARDED_INTERSTITIAL);
    const ok = await showMonetagRewarded();
    return ok;
  } catch {
    return false;
  }
}

/**
 * Show a Monetag rewarded ad as a post-roll AFTER a game session ends.
 * Silent failure — never disrupts return-to-menu UX.
 */
export async function playPostRoll(): Promise<boolean> {
  try {
    const ok = await showMonetagRewarded();
    return ok;
  } catch {
    return false;
  }
}

/**
 * Convenience helper: shows a short toast + plays pre-roll, then runs `launch`.
 * Use it on game-card click handlers.
 */
export async function gateGameLaunch(launch: () => void | Promise<void>): Promise<void> {
  toast.info("Loading short ad…", { duration: 1500 });
  await playPreRoll();
  await launch();
}
