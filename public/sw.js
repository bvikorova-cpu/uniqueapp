// Unique – Web Push service worker (no caching; push + notification only)
// NOTE: no third-party ad service worker may be imported here. The Monetag
// push SW (5gvci.com) was sending unsolicited ad notifications ("Install VPN")
// to installed users — never re-add importScripts of any ad network.

self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = null;
  try { data = event.data ? event.data.json() : null; } catch { data = null; }

  // Only show notifications that come from our own backend (send-push always
  // sends JSON with a title). Anything else (ad-network pushes) is dropped.
  if (!data || typeof data !== "object" || (!data.title && !data.kind)) return;


  const isCall = data.kind === "call";
  const title = data.title || (isCall ? "Incoming call" : "Unique");
  const options = {
    body: data.body || "",
    icon: "/unique-icon-v3-192.png",
    badge: "/unique-icon-v3-192.png",
    tag: isCall ? `call-${data.caller_id || "x"}` : `msg-${data.conversation_id || Date.now()}`,
    renotify: true,
    requireInteraction: isCall,
    vibrate: isCall ? [400, 200, 400, 200, 400, 200, 400] : [200, 100, 200],
    data: { url: data.url || "/messenger", kind: data.kind },
    actions: isCall
      ? [{ action: "answer", title: "Answer" }, { action: "decline", title: "Decline" }]
      : [],
    silent: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/messenger";

  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of allClients) {
      try {
        const url = new URL(c.url);
        if (url.pathname.startsWith("/messenger")) {
          await c.focus();
          c.postMessage({ type: "push-click", action: event.action, data: event.notification.data });
          return;
        }
      } catch {}
    }
    if (self.clients.openWindow) await self.clients.openWindow(targetUrl);
  })());
});
