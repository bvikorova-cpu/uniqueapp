/**
 * Persistent image caching for the collectible-card sections.
 *
 * Card artwork is served with immutable cache headers, so the browser's own
 * HTTP/disk cache is the fastest and most reliable store — it is the only cache
 * an <img> consults. Warming therefore just fetches through `Image()` so the
 * exact URLs the grid renders land in the disk cache and survive hard refresh.
 */

import { cardThumbUrl } from "./cardImageUrl";

const warmed = new Set<string>();

export async function warmCollectionCardImages(urls: (string | null | undefined)[]) {
  if (typeof window === "undefined") return;
  const list = urls
    .map((u) => cardThumbUrl(u))
    .filter((u): u is string => !!u && !warmed.has(u));
  if (!list.length) return;
  list.forEach((u) => warmed.add(u));

  list.forEach((u) => {
    const img = new Image();
    img.decoding = "async";
    img.src = u;
  });
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
