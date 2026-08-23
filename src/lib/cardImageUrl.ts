/**
 * Collectible-card image URLs.
 *
 * Card artwork is stored as full-size PNG (often >1 MB). Rendering the raw
 * object makes an album of 24 cards download tens of megabytes, so the grid
 * looks like it "opens card by card". The storage render endpoint returns a
 * resized, quality-tuned copy with immutable cache headers
 * (`cache-control: public, max-age=31536000`), so after the first view the
 * browser serves it from disk cache — even after a hard refresh.
 */

const OBJECT_MARKER = "/storage/v1/object/public/";
const RENDER_MARKER = "/storage/v1/render/image/public/";

export function cardImageUrl(
  url: string | null | undefined,
  width: number,
  quality = 70,
): string | undefined {
  if (!url) return undefined;
  if (!url.includes(OBJECT_MARKER)) return url;
  const base = url.replace(OBJECT_MARKER, RENDER_MARKER);
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}width=${width}&quality=${quality}&resize=contain`;
}

/** Grid thumbnails — small and fast. */
export const cardThumbUrl = (url: string | null | undefined) => cardImageUrl(url, 420, 68);

/** Full-card views (draw reveal, detail modal, prime card). */
export const cardLargeUrl = (url: string | null | undefined) => cardImageUrl(url, 900, 78);
