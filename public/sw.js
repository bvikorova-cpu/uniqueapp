/**
 * KILL-SWITCH service worker at /sw.js.
 *
 * The previous release registered a Workbox-based service worker at this path
 * via vite-plugin-pwa. That worker over-cached the app shell / precache and
 * caused installed PWAs and returning browsers to fail to load. This worker
 * replaces it at the SAME path so returning clients evict the old registration
 * on the next visit.
 *
 * Behaviour: wipe caches on install + activate, unregister self, forward all
 * navigations to the network with `cache: no-store`. No redirects, no caching.
 */

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch {
        /* noop */
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(fetch(event.request, { cache: "no-store" }));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch {
        /* noop */
      }
      try {
        await self.clients.claim();
        const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        await Promise.all(
          clients.map((client) => {
            const url = new URL(client.url);
            url.searchParams.set("sw-cleanup", Date.now().toString());
            return client.navigate(url.toString()).catch(() => undefined);
          }),
        );
      } finally {
        await self.registration.unregister();
      }
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
