/**
 * KILL-SWITCH service worker.
 *
 * Older versions cached navigation HTML (and even did host redirects), which
 * trapped users on stale shells / loader screens. This SW now does the OPPOSITE:
 * on install + activate it wipes every cache and unregisters itself, and on
 * fetch it just forwards to the network with `cache: no-store`. No redirects,
 * no caching. Keep it this way until the offline strategy is fully redesigned.
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
  // Always go to network — never serve cached HTML, never redirect.
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
      await self.clients.claim();
      const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      await Promise.all(clients.map((client) => {
        const url = new URL(client.url);
        url.searchParams.set("sw-cleanup", Date.now().toString());
        return client.navigate(url.toString()).catch(() => undefined);
      }));
      await self.registration.unregister();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
