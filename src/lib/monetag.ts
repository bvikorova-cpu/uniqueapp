import { supabase } from "@/integrations/supabase/client";

// Monetag — SAFE formats only.
// We intentionally use ONLY "In-Page Push" (small dismissible corner notification).
// NO Popunder, NO Vignette, NO redirects, NO phone-number ads, NO notification prompts.
// This gives real impressions in your Monetag dashboard so you earn revenue.
const MONETAG_SCRIPT_SRC = "https://nap5k.com/tag.min.js";

export const MONETAG_ZONES = {
  IN_PAGE_PUSH: "11037514",
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
  loadMonetagZone(MONETAG_ZONES.IN_PAGE_PUSH);
}

export function trackMonetagEvent(eventType: "click" | "impression", zoneId: string, sectionKey: string): void {
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
