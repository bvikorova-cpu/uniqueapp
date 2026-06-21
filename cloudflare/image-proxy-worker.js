/**
 * Cloudflare Worker — Image Resizing proxy in front of Supabase Storage.
 *
 * Deploy:
 *   1. Cloudflare Dashboard → Workers → Create.
 *   2. Paste this file. Set route: cdn.uniqueapp.fun/*
 *   3. Enable Image Resizing (Speed → Optimization → Image Resizing).
 *   4. Set env var SUPABASE_STORAGE_BASE = "https://jufrdzeonywluwutvyxz.supabase.co/storage/v1/object/public"
 *
 * URL contract (matches src/lib/cdnUrl.ts):
 *   https://cdn.uniqueapp.fun/<bucket>/<path>?w=&h=&fit=&q=&f=
 *
 * Cache: 30 days at edge, immutable. Origin requests only on first miss.
 */

const ALLOWED_FITS = new Set(["cover", "contain", "scale-down"]);
const ALLOWED_FORMATS = new Set(["webp", "avif", "jpeg", "png"]);
const MAX_DIM = 2048;

export default {
  async fetch(request, env, ctx) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/+/, "");
    if (!path) return new Response("Not Found", { status: 404 });

    const base = env.SUPABASE_STORAGE_BASE?.replace(/\/$/, "");
    if (!base) return new Response("Misconfigured", { status: 500 });

    const origin = `${base}/${path}`;

    // Build CF Image Resizing options from query params.
    const w = clampInt(url.searchParams.get("w"), 16, MAX_DIM);
    const h = clampInt(url.searchParams.get("h"), 16, MAX_DIM);
    const q = clampInt(url.searchParams.get("q"), 1, 100) ?? 80;
    const fit = ALLOWED_FITS.has(url.searchParams.get("fit")) ? url.searchParams.get("fit") : "cover";
    const f = url.searchParams.get("f");
    const format = ALLOWED_FORMATS.has(f) ? f : "auto";

    const cfImage = { quality: q, fit, format };
    if (w) cfImage.width = w;
    if (h) cfImage.height = h;

    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    const resp = await fetch(origin, {
      cf: { image: cfImage, cacheEverything: true, cacheTtl: 2592000 },
    });

    if (!resp.ok) {
      return new Response(`Upstream ${resp.status}`, { status: resp.status });
    }

    const headers = new Headers(resp.headers);
    headers.set("Cache-Control", "public, max-age=2592000, immutable");
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("X-CDN", "uniqueapp-cf");

    const out = new Response(resp.body, { status: 200, headers });
    ctx.waitUntil(cache.put(cacheKey, out.clone()));
    return out;
  },
};

function clampInt(raw, min, max) {
  if (!raw) return null;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n)) return null;
  return Math.max(min, Math.min(max, n));
}
