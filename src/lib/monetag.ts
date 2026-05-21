import { supabase } from "@/integrations/supabase/client";

// Lazy loader for Monetag single-zone tags.
// By default each zone is injected once, but rewarded ads force a fresh
// injection per click because Monetag pop/vignette tags fire on script load.

const loaded = new Set<string>();

type LoadMonetagOptions = { reload?: boolean };

export function loadMonetagZone(zoneId: string | number, options: LoadMonetagOptions = {}): void {
  const id = String(zoneId);
  if (!options.reload && loaded.has(id)) return;
  loaded.add(id);
  try {
    if (options.reload) {
      document.querySelectorAll(`script[data-monetag-zone="${id}"]`).forEach((node) => node.remove());
    }
    const s = document.createElement("script");
    s.src = `https://nap5k.com/tag.min.js?rnd=${Date.now()}_${Math.random().toString(36).slice(2)}`;
    s.async = true;
    s.setAttribute("data-zone", id);
    s.setAttribute("data-monetag-zone", id);
    s.setAttribute("data-cfasync", "false");
    document.head.appendChild(s);
  } catch {
    /* noop */
  }
}

export const MONETAG_ZONES = {
  IN_PAGE_PUSH: "11037514",
  VIGNETTE: "11037515",
  POPUNDER: "11037513",
} as const;

export const MONETAG_ZONE_IDS = Object.values(MONETAG_ZONES);

/** Load all revenue-generating Monetag zones at once. Safe to call repeatedly. */
export function loadAllMonetagZones(options: LoadMonetagOptions = {}): void {
  loadMonetagZone(MONETAG_ZONES.POPUNDER, options);
  loadMonetagZone(MONETAG_ZONES.IN_PAGE_PUSH, options);
  loadMonetagZone(MONETAG_ZONES.VIGNETTE, options);
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
