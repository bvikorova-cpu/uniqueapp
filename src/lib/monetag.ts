import { supabase } from "@/integrations/supabase/client";

// Monetag — SAFE formats only.
// In-Page Push runs automatically in background.
// Vignette Banner (REWARDED_VIGNETTE) is triggered on demand when user clicks Watch Ad.
const MONETAG_SCRIPT_SRC = "https://nap5k.com/tag.min.js";

export const MONETAG_ZONES = {
  // IN_PAGE_PUSH disabled — was showing fake notification ads (messages, phone numbers)
  REWARDED_VIGNETTE: "11037515", // Vignette Banner — fullscreen on click
  SAFE_VIDEO: "safe-video-reward",
} as const;

export const MONETAG_ZONE_IDS = Object.values(MONETAG_ZONES);

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
  // Only load on-demand rewarded zone. In-Page Push removed.
  loadMonetagZone(MONETAG_ZONES.REWARDED_VIGNETTE);
}

/**
 * Trigger Monetag fullscreen ad on demand (Vignette Banner).
 * Resolves true if ad was shown, false otherwise (timeout, blocked, SDK not loaded).
 */
export function showMonetagRewarded(
  zoneId: string = MONETAG_ZONES.REWARDED_VIGNETTE
): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    loadMonetagZone(zoneId);

    const fnName = `show_${zoneId}`;
    const tryShow = (attempt = 0) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fn = (window as any)[fnName];
      if (typeof fn === "function") {
        try {
          const result = fn();
          if (result && typeof result.then === "function") {
            result.then(() => resolve(true)).catch(() => resolve(false));
          } else {
            resolve(true);
          }
        } catch {
          resolve(false);
        }
        return;
      }
      if (attempt >= 20) {
        resolve(false); // ~5s — SDK not ready, fallback
        return;
      }
      setTimeout(() => tryShow(attempt + 1), 250);
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
