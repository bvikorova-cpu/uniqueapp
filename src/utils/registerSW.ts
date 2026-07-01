/**
 * Service worker registration (vite-plugin-pwa / Workbox).
 *
 * Registers `/sw.js` (generated at build time by VitePWA) so the installed
 * PWA gets a proper offline shell + cache. Previous kill-switch behaviour is
 * kept for hostile contexts: dev, Lovable preview, iframes, and `?sw=off`.
 *
 * Strategy summary (see vite.config.ts for the full Workbox config):
 *   - HTML navigations → NetworkFirst (4s timeout) → cached shell fallback
 *   - /assets/*.js|css|woff2 → CacheFirst (30d)
 *   - Images → StaleWhileRevalidate (14d)
 *   - Supabase / Stripe / Analytics / /functions/* → NEVER cached (bypassed)
 */

const APP_SW_PATHS = ["/sw.js", "/service-worker.js"];

function isHostileContext(): boolean {
  if (typeof window === "undefined") return true;
  try {
    // Lovable preview / dev / iframe → never register.
    if (!import.meta.env.PROD) return true;
    if (window.top && window.top !== window) return true;
    const host = window.location.hostname;
    if (host.startsWith("id-preview--") || host.startsWith("preview--")) return true;
    if (host === "lovableproject.com" || host.endsWith(".lovableproject.com")) return true;
    if (host === "lovableproject-dev.com" || host.endsWith(".lovableproject-dev.com")) return true;
    if (host === "beta.lovable.dev" || host.endsWith(".beta.lovable.dev")) return true;
    if (new URLSearchParams(window.location.search).get("sw") === "off") return true;
  } catch {
    return true;
  }
  return false;
}

async function unregisterAppSWs() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs
        .filter((r) => {
          const url = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || "";
          return APP_SW_PATHS.some((p) => url.endsWith(p));
        })
        .map((r) => r.unregister().catch(() => false)),
    );
  } catch {
    /* noop */
  }
}

export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  if (isHostileContext()) {
    // Safety: clean up any previously-registered app SW so preview always loads fresh code.
    void unregisterAppSWs();
    return;
  }

  const run = () => {
    // Dynamically import workbox-window so it stays out of the initial bundle.
    import("workbox-window")
      .then(({ Workbox }) => {
        const wb = new Workbox("/sw.js", { scope: "/" });
        // When a new SW takes control, reload once so the user gets fresh code.
        let reloading = false;
        wb.addEventListener("controlling", () => {
          if (reloading) return;
          reloading = true;
          window.location.reload();
        });
        wb.register().catch((err) => {
          console.warn("[SW] registration failed", err);
        });
      })
      .catch((err) => console.warn("[SW] workbox-window load failed", err));
  };

  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
}
