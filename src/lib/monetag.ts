// Lazy loader for Monetag single-zone tags.
// Each zone is injected at most once per page load.

const loaded = new Set<string>();

export function loadMonetagZone(zoneId: string | number): void {
  const id = String(zoneId);
  if (loaded.has(id)) return;
  loaded.add(id);
  try {
    const s = document.createElement("script");
    s.src = "https://nap5k.com/tag.min.js";
    s.async = true;
    s.setAttribute("data-zone", id);
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

/** Load all revenue-generating Monetag zones at once. Safe to call repeatedly. */
export function loadAllMonetagZones(): void {
  loadMonetagZone(MONETAG_ZONES.POPUNDER);
  loadMonetagZone(MONETAG_ZONES.IN_PAGE_PUSH);
  loadMonetagZone(MONETAG_ZONES.VIGNETTE);
}
