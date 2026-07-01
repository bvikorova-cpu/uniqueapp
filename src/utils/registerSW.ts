/**
 * Service worker cleanup wrapper.
 *
 * The previous release shipped a Workbox-based service worker (vite-plugin-pwa)
 * at /sw.js that over-cached the app shell and broke the installed PWA. We now
 * ship kill-switch workers at both /sw.js and /service-worker.js (see public/).
 *
 * This module never REGISTERS a service worker. It only ensures returning
 * clients pick up the replacement kill-switch worker so their old registration
 * is evicted. The kill-switch workers self-unregister on activate.
 */

const APP_SW_PATHS = ["/sw.js", "/service-worker.js"];

export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  // Best-effort: force an update on any existing app SW registrations so the
  // browser fetches the new kill-switch worker at the same path and evicts it.
  const cleanup = async () => {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        regs
          .filter((r) => {
            const url = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || "";
            return APP_SW_PATHS.some((p) => url.endsWith(p));
          })
          .map((r) => r.update().catch(() => undefined)),
      );
    } catch {
      /* noop */
    }
  };

  if (document.readyState === "complete") void cleanup();
  else window.addEventListener("load", () => void cleanup(), { once: true });
}
