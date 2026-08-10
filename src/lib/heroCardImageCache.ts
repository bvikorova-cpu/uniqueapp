/**
 * Hero card image caching.
 *
 * - Server side: card artwork is uploaded to Supabase Storage with a 1-year
 *   `cacheControl`, so the CDN + browser HTTP cache serve repeats instantly.
 * - Client side: we additionally warm the Cache Storage API so images survive
 *   memory-cache eviction and load immediately on repeat visits (even offline).
 */

const CACHE_NAME = "hero-card-art-v1";
const CATALOGUE_KEY = "hero-cards-catalogue-v1";

const warmed = new Set<string>();

const cacheSupported = () =>
  typeof window !== "undefined" && "caches" in window && window.isSecureContext;

/** Store card images in Cache Storage so repeat renders are instant. */
export async function warmHeroCardImages(urls: (string | null | undefined)[]) {
  const list = urls.filter((u): u is string => !!u && !warmed.has(u));
  if (!list.length) return;
  list.forEach((u) => warmed.add(u));

  if (!cacheSupported()) {
    // Fallback: prime the regular HTTP cache.
    list.forEach((u) => {
      const img = new Image();
      img.decoding = "async";
      img.src = u;
    });
    return;
  }

  try {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(
      list.map(async (url) => {
        try {
          if (await cache.match(url)) return;
          await cache.add(new Request(url, { mode: "cors" }));
        } catch {
          /* ignore individual failures */
        }
      }),
    );
  } catch {
    /* cache storage unavailable */
  }
}

/** Persist the card catalogue so the album renders instantly on revisit. */
export function readCachedCatalogue<T>(): T | undefined {
  try {
    const raw = localStorage.getItem(CATALOGUE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { rows: T; savedAt: number };
    if (!parsed?.rows) return undefined;
    if (Date.now() - parsed.savedAt > 7 * 24 * 60 * 60 * 1000) return undefined;
    return parsed.rows;
  } catch {
    return undefined;
  }
}

export function writeCachedCatalogue<T>(rows: T) {
  try {
    localStorage.setItem(CATALOGUE_KEY, JSON.stringify({ rows, savedAt: Date.now() }));
  } catch {
    /* quota exceeded – caching is best-effort */
  }
}
