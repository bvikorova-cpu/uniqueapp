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

  const requestUrl = new URL(event.request.url);
  if (requestUrl.hostname === "preview--uniqueapp.lovable.app") {
    const targetUrl = new URL("https://id-preview--3ea492b4-277a-4b1d-a6dd-ca2a3efd9225.lovable.app");
    targetUrl.pathname = requestUrl.pathname;
    targetUrl.search = requestUrl.search;
    targetUrl.hash = requestUrl.hash;
    event.respondWith(Response.redirect(targetUrl.toString(), 302));
    return;
  }

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
            const clientUrl = new URL(client.url);
            if (clientUrl.hostname === "preview--uniqueapp.lovable.app") {
              const targetUrl = new URL("https://id-preview--3ea492b4-277a-4b1d-a6dd-ca2a3efd9225.lovable.app");
              targetUrl.pathname = clientUrl.pathname;
              targetUrl.search = clientUrl.search;
              targetUrl.hash = clientUrl.hash;
              client.navigate(targetUrl.toString());
            } else {
              client.navigate(client.url);
            }
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
