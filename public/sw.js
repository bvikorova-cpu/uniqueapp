/**
 * KILL-SWITCH service worker.
 *
 * A previous version of this SW cached navigation HTML aggressively, which left
 * users stuck on a stale shell that referenced a missing JS bundle (white/loader
 * screen forever). This file now does the opposite: on install it unregisters
 * itself and wipes every cache, so the next reload fetches a fresh index.html
 * directly from the network.
 *
 * Keep this file in place (and DO NOT re-introduce caching) until we are sure
 * no clients are still pinned to the old SW.
 */

self.addEventListener("install", (event) => {
  self.skipWaiting();
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
        await self.registration.unregister();
      } catch {
        /* noop */
      }
      try {
        const clients = await self.clients.matchAll({ type: "window" });
        clients.forEach((client) => {
          try {
            client.navigate(client.url);
          } catch {
            /* noop */
          }
        });
      } catch {
        /* noop */
      }
    })(),
  );
});

// Pass-through: never intercept fetches.
self.addEventListener("fetch", () => {});
