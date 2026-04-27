/**
 * Minimal offline-shell service worker.
 *
 * Strategy:
 *  - Pre-cache the app shell (/, /offline.html, manifest, PWA icons) on install.
 *  - Network-first for navigation requests; fall back to cached shell or /offline.html.
 *  - Stale-while-revalidate for same-origin static assets (images, fonts, css, js).
 *  - NEVER cache Supabase API / functions / auth / storage — must always hit network.
 *  - NEVER cache POST/PUT/DELETE — only GET.
 *
 * Bump CACHE_VERSION whenever the shell or strategy changes; old caches are pruned
 * automatically on activate.
 */

const CACHE_VERSION = "v1-2026-04-27";
const SHELL_CACHE = `unique-shell-${CACHE_VERSION}`;
const ASSET_CACHE = `unique-assets-${CACHE_VERSION}`;

const SHELL_URLS = [
  "/",
  "/offline.html",
  "/manifest.webmanifest",
  "/pwa-192x192.png",
  "/pwa-512x512.png",
  "/favicon.ico",
];

// Anything whose host matches these patterns is API-like and MUST NOT be cached.
const NEVER_CACHE_HOST_PATTERNS = [
  /\.supabase\.co$/i,
  /pagead2\.googlesyndication\.com$/i,
  /googletagmanager\.com$/i,
  /google-analytics\.com$/i,
  /stripe\.com$/i,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS).catch(() => {}))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== SHELL_CACHE && k !== ASSET_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isNeverCacheHost(url) {
  return NEVER_CACHE_HOST_PATTERNS.some((rx) => rx.test(url.hostname));
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Skip API/3rd-party hosts entirely — they go straight to network.
  if (isNeverCacheHost(url)) return;

  // Navigations: network-first, fall back to cached shell, then /offline.html.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Cache a copy of the navigation HTML for next-load offline support.
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          const offline = await caches.match("/offline.html");
          return (
            offline ||
            new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } })
          );
        }),
    );
    return;
  }

  // Same-origin static assets: stale-while-revalidate.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(ASSET_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        const fetchPromise = fetch(req)
          .then((res) => {
            if (res && res.status === 200 && res.type === "basic") {
              cache.put(req, res.clone()).catch(() => {});
            }
            return res;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      }),
    );
  }
});

// Allow the page to trigger an immediate update.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
