/**
 * CDN URL helper — rewrites Supabase Storage public URLs to a Cloudflare
 * image-resizing proxy when VITE_CDN_BASE_URL is set.
 *
 * Setup (done by ops, not the app):
 *   1. Create R2 bucket mirrored from Supabase Storage (or use CF as caching
 *      reverse proxy in front of <project>.supabase.co/storage/v1/object/public).
 *   2. DNS: cdn.uniqueapp.fun → Cloudflare Worker (see cloudflare/image-proxy-worker.js).
 *   3. Set VITE_CDN_BASE_URL=https://cdn.uniqueapp.fun in .env.
 *
 * When unset, getCdnUrl is a no-op (returns the original URL), so the app
 * works identically with or without the CDN.
 */

const CDN_BASE = (import.meta.env.VITE_CDN_BASE_URL as string | undefined)?.replace(/\/$/, "");

const SUPABASE_STORAGE_RE =
  /^https?:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/(.+)$/i;

export interface CdnOptions {
  /** Target width in CSS px. Worker picks nearest DPR multiple. */
  width?: number;
  /** Target height in CSS px. */
  height?: number;
  /** "cover" (default) or "contain". */
  fit?: "cover" | "contain";
  /** JPEG/WebP quality 1-100, default 80. */
  quality?: number;
  /** Force output format. Worker auto-negotiates AVIF/WebP otherwise. */
  format?: "auto" | "webp" | "avif" | "jpeg" | "png";
}

/**
 * Rewrite a Supabase Storage public URL through the CDN proxy.
 * Pass-through for anything else (data URLs, external CDNs, signed URLs).
 */
export function getCdnUrl(url: string | null | undefined, opts: CdnOptions = {}): string {
  if (!url) return "";
  if (!CDN_BASE) return url;
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;

  const match = url.match(SUPABASE_STORAGE_RE);
  if (!match) return url;

  const [, path] = match;
  const params = new URLSearchParams();
  if (opts.width) params.set("w", String(opts.width));
  if (opts.height) params.set("h", String(opts.height));
  if (opts.fit) params.set("fit", opts.fit);
  if (opts.quality) params.set("q", String(opts.quality));
  if (opts.format && opts.format !== "auto") params.set("f", opts.format);

  const query = params.toString();
  return `${CDN_BASE}/${path}${query ? `?${query}` : ""}`;
}

/** Generate `srcset` for responsive images. */
export function getCdnSrcSet(url: string | null | undefined, widths: number[]): string {
  if (!url) return "";
  return widths
    .map((w) => `${getCdnUrl(url, { width: w })} ${w}w`)
    .join(", ");
}
