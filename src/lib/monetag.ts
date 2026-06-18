import { supabase } from "@/integrations/supabase/client";

// Monetag — SAFE formats only.
// REWARDED_INTERSTITIAL is the official Rewarded zone — Promise resolves on full view, rejects on skip.
// REWARDED_VIGNETTE is kept as a fallback for placements that previously used it.
const MONETAG_SCRIPT_SRC = "https://nap5k.com/tag.min.js";

// Allow overriding the rewarded zone via env without a code change.
// Configure VITE_MONETAG_REWARDED_ZONE_ID in your env when you create the
// dedicated Rewarded Interstitial zone in the Monetag dashboard.
const REWARDED_FROM_ENV = (
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ?.VITE_MONETAG_REWARDED_ZONE_ID ?? ""
).trim();

export const MONETAG_ZONES = {
  // Rewarded Interstitial — proper rewarded protocol (Promise resolves on full view).
  // Defaults to the vignette zone until a dedicated rewarded zone is provisioned.
  REWARDED_INTERSTITIAL: REWARDED_FROM_ENV || "11037515",
  // Vignette Banner — fullscreen banner; no rewarded protocol (kept for legacy callers).
  REWARDED_VIGNETTE: "11037515",
  SAFE_VIDEO: "safe-video-reward",
} as const;

export const MONETAG_ZONE_IDS = Array.from(
  new Set(Object.values(MONETAG_ZONES).filter((z) => z !== "safe-video-reward"))
);

// Anti-abuse is enforced at the RPC layer via `ref_id` dedup, not via timing
// gates here. Monetag SDKs settle their promise at unpredictable points and
// timing-based gates produced false negatives (missed XP credits).
const SDK_WAIT_MS = 10_000; // wait up to 10s for the SDK function to mount
const POLL_INTERVAL_MS = 250;

const loadedZones = new Set<string>();

export function loadMonetagZone(zoneId: string | number): void {
  if (typeof window === "undefined") return;
  const id = String(zoneId);
  if (!id || id === MONETAG_ZONES.SAFE_VIDEO) return;
  if (loadedZones.has(id)) return;
  loadedZones.add(id);

  try {
    const script = document.createElement("script");
    script.src = MONETAG_SCRIPT_SRC;
    script.setAttribute("data-zone", id);
    script.async = true;
    script.dataset.monetagZone = id;
    document.body.appendChild(script);
  } catch {
    // Never break the app because of an ad script.
  }
}

export function loadAllMonetagZones(): void {
  // Preload the rewarded zone so the first click is instant.
  loadMonetagZone(MONETAG_ZONES.REWARDED_INTERSTITIAL);
}

/**
 * Trigger a Monetag rewarded ad on demand.
 *
 * Resolves:
 *   true  — ad completed successfully (rewarded protocol resolved),
 *           or vignette fallback closed AFTER MIN_VALID_VIEW_MS (impression counted).
 *   false — SDK never mounted, fn threw synchronously,
 *           or the user dismissed the ad before MIN_VALID_VIEW_MS.
 */
export function showMonetagRewarded(
  zoneId: string = MONETAG_ZONES.REWARDED_INTERSTITIAL
): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    loadMonetagZone(zoneId);

    const fnName = `show_${zoneId}`;
    const maxAttempts = Math.ceil(SDK_WAIT_MS / POLL_INTERVAL_MS);

    const tryShow = (attempt = 0) => {
      const fn = (window as unknown as Record<string, unknown>)[fnName] as
        | ((...args: unknown[]) => unknown)
        | undefined;

      if (typeof fn === "function") {
        // Once the SDK function is called, Monetag will serve an impression.
        // The returned Promise settles at different points depending on zone
        // format (open / close / skip / never), so we treat ANY settlement —
        // and a non-promise return — as a successful impression. Dedup at the
        // RPC layer (`ref_id` UNIQUE on award_xp) prevents abuse: each ad slot
        // can only credit 1 XP per user per day regardless of clicks.
        let settled = false;
        const settle = (ok: boolean) => {
          if (settled) return;
          settled = true;
          resolve(ok);
        };
        try {
          const result = fn();
          if (result && typeof (result as Promise<unknown>).then === "function") {
            (result as Promise<unknown>)
              .then(() => settle(true))
              .catch(() => settle(true));
          } else {
            // Non-promise SDKs (legacy vignette): impression already served.
            settle(true);
          }
          // Anti-stall: if SDK never settles (popunder, blocked iframe, etc.)
          // still resolve after 30s so the user is not left hanging.
          setTimeout(() => settle(true), 30_000);
        } catch {
          settle(false);
        }
        return;
      }
      if (attempt >= maxAttempts) {
        resolve(false); // SDK not ready — fallback
        return;
      }
      setTimeout(() => tryShow(attempt + 1), POLL_INTERVAL_MS);
    };
    tryShow();
  });
}

export function trackMonetagEvent(
  eventType: "click" | "impression",
  zoneId: string,
  sectionKey: string
): void {
  void (async () => {
    try {
      const { error } = await supabase.from("monetag_ad_events").insert({
        event_type: eventType,
        zone_id: zoneId,
        revenue: 0,
        currency: "USD",
        sub_id: sectionKey,
        raw: { source: "app_watch_ad" },
      });
      if (error) console.warn("Monetag tracking skipped", error.message);
    } catch {
      // Tracking must never block the ad or XP flow.
    }
  })();
}
