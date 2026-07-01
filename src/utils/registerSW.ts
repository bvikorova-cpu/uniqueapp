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

  // Best-effort: force an update/unregister on any existing app SW
  // registrations. This is cleanup only — no new app-shell SW is registered.
  const cleanup = async () => {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      const appRegs = regs.filter((r) => {
        const scriptUrl = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || "";
        try {
          const path = new URL(scriptUrl).pathname;
          return APP_SW_PATHS.includes(path);
        } catch {
          return APP_SW_PATHS.some((p) => scriptUrl.endsWith(p));
        }
      });
      await Promise.allSettled(
        appRegs.map(async (r) => {
          await r.update().catch(() => undefined);
          await r.unregister().catch(() => undefined);
        }),
      );
      if (navigator.serviceWorker.controller && appRegs.length > 0) {
        const key = "unique_sw_cleanup_reload_v4";
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, String(Date.now()));
          window.location.reload();
        }
      }
    } catch {
      /* noop */
    }
  };

  if (document.readyState === "complete") void cleanup();
  else window.addEventListener("load", () => void cleanup(), { once: true });
}
