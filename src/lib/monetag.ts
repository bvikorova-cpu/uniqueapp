import { supabase } from "@/integrations/supabase/client";

type LoadMonetagOptions = { reload?: boolean };

export function loadMonetagZone(zoneId: string | number, _options: LoadMonetagOptions = {}): void {
  // Disabled by design: no third-party popups, redirects, phone-number ads,
  // or notification prompts are injected into the app.
  void zoneId;
}

export const MONETAG_ZONES = {
  SAFE_VIDEO: "safe-video-reward",
} as const;

export const MONETAG_ZONE_IDS = Object.values(MONETAG_ZONES);

export function loadAllMonetagZones(_options: LoadMonetagOptions = {}): void {
  // Kept for compatibility with existing callers; intentionally no-op.
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
