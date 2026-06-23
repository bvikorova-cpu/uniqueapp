import { loadMonetagZone, MONETAG_ZONES } from "@/lib/monetag";

/**
 * Imperative ad-gate controller used by Games / GamesHub.
 *
 * The actual UI lives in <GameAdGateHost />, mounted once near the app root.
 * We expose a tiny event-bus so any page can open the gate and await its close.
 */
type Phase = "pre" | "post";

type Listener = (phase: Phase, done: () => void) => void;

let listener: Listener | null = null;

export function _registerAdGateHost(fn: Listener | null) {
  listener = fn;
}

function openGate(phase: Phase): Promise<void> {
  // Pre-warm Monetag SDK so first impression is fast.
  loadMonetagZone(MONETAG_ZONES.REWARDED_INTERSTITIAL);

  return new Promise((resolve) => {
    if (!listener) {
      // Host not mounted — never block gameplay.
      resolve();
      return;
    }
    listener(phase, () => resolve());
  });
}

export function playPreRoll(): Promise<void> {
  return openGate("pre");
}

export function playPostRoll(): Promise<void> {
  return openGate("post");
}

/**
 * Convenience: shows the pre-roll gate, then runs `launch` once user continues.
 */
export async function gateGameLaunch(launch: () => void | Promise<void>): Promise<void> {
  await openGate("pre");
  await launch();
}
