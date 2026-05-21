import { supabase } from "@/integrations/supabase/client";

// Lazy loader for Monetag single-zone tags.
// By default each zone is injected once, but rewarded ads force a fresh
// injection per click because Monetag pop/vignette tags fire on script load.

const loaded = new Set<string>();

type LoadMonetagOptions = { reload?: boolean };

export function loadMonetagZone(zoneId: string | number, _options: LoadMonetagOptions = {}): void {
  const id = String(zoneId);
  // Always inject only once per page-load. No reload, no cache-buster.
  // Popunder/Vignette behave like virus pop-ups on mobile, so we never use them.
  if (loaded.has(id)) return;
  loaded.add(id);
  try {
    const s = document.createElement("script");
    s.src = `https://nap5k.com/tag.min.js`;
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
  // Only In-Page Push — slušná notifikácia v rohu, nie virusne pop-upy.
  IN_PAGE_PUSH: "11037514",
} as const;

export const MONETAG_ZONE_IDS = Object.values(MONETAG_ZONES);

/** Load only the non-intrusive In-Page Push zone. */
export function loadAllMonetagZones(_options: LoadMonetagOptions = {}): void {
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
