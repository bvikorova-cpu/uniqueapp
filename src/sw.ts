/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { NetworkFirst, CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { createHandlerBoundToURL } from "workbox-precaching";

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

// Kill old versions ASAP.
self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();

// Precache all build assets.
precacheAndRoute(self.__WB_MANIFEST);

// SPA navigation fallback (so refresh works offline/with SW).
const handler = createHandlerBoundToURL("/index.html");
registerRoute(new NavigationRoute(handler));

// Avoid stale app data from API.
registerRoute(
  ({ url }) => url.origin === "https://jufrdzeonywluwutvyxz.supabase.co",
  new NetworkFirst({
    cacheName: "supabase-api-cache",
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 5, // 5 minutes
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

registerRoute(
  ({ request, url }) =>
    request.destination === "image" || /\.(?:png|jpg|jpeg|svg|gif|webp)$/i.test(url.pathname),
  new CacheFirst({
    cacheName: "images-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
    ],
  })
);

registerRoute(
  ({ request, url }) => request.destination === "font" || /\.(?:woff|woff2|ttf|eot)$/i.test(url.pathname),
  new CacheFirst({
    cacheName: "fonts-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
    ],
  })
);
