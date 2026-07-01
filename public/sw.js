// Unique – Web Push service worker (no caching; push + notification only)
// Monetag verification + ad service worker (merged)
self.options = {
  "domain": "5gvci.com",
  "zoneId": 11037516
};
self.lary = "";
try {
  importScripts('https://5gvci.com/act/files/service-worker.min.js?r=sw');
} catch (e) {
  // Monetag SW unreachable — keep our push working anyway
}

self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { title: "Unique", body: event.data?.text?.() || "" }; }

  const isCall = data.kind === "call";
  const title = data.title || (isCall ? "Incoming call" : "Unique");
  const options = {
    body: data.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
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
