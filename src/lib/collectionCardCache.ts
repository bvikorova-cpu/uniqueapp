/**
 * Persistent image caching for the collectible-card sections.
 * Mirrors the hero-card cache but is namespaced per category.
 */

const CACHE_NAME = "collection-card-art-v1";

const warmed = new Set<string>();

const cacheSupported = () =>
  typeof window !== "undefined" && "caches" in window && window.isSecureContext;

export async function warmCollectionCardImages(urls: (string | null | undefined)[]) {
  const list = urls.filter((u): u is string => !!u && !warmed.has(u));
  if (!list.length) return;
  list.forEach((u) => warmed.add(u));

  if (!cacheSupported()) {
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

const key = (slug: string) => `collection-catalogue-v1:${slug}`;

export function readCachedCategory<T>(slug: string): T | undefined {
  try {
    const raw = localStorage.getItem(key(slug));
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { rows: T; savedAt: number };
    if (!parsed?.rows) return undefined;
    const rows = parsed.rows as unknown;
    // Catalogues that are still missing artwork are only cached briefly so new
    // illustrations appear as soon as they are generated.
    const incomplete = Array.isArray(rows) && rows.some((r: any) => !r?.image_url);
    const ttl = incomplete ? 5 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - parsed.savedAt > ttl) return undefined;
    return parsed.rows;
  } catch {
    return undefined;
  }
}

export function writeCachedCategory<T>(slug: string, rows: T) {
  try {
    localStorage.setItem(key(slug), JSON.stringify({ rows, savedAt: Date.now() }));
  } catch {
    /* quota exceeded – caching is best-effort */
  }
}
