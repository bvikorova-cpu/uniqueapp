import { UNIQUE_STICKERS } from "@/data/stickers";

const STICKER_URLS = new Set(UNIQUE_STICKERS.map((s) => s.url));

/**
 * Returns the sticker image URL when a message body is a single Unique sticker,
 * otherwise null (so the text is rendered normally).
 */
export function stickerUrlFromContent(content?: string | null): string | null {
  if (!content) return null;
  const trimmed = content.trim();
  if (!trimmed || /\s/.test(trimmed)) return null;
  if (STICKER_URLS.has(trimmed)) return trimmed;
  // Absolute URL variant (same asset path served from another origin).
  try {
    const path = new URL(trimmed, window.location.origin).pathname;
    return STICKER_URLS.has(path) ? trimmed : null;
  } catch {
    return null;
  }
}
