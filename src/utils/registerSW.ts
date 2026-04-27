/**
 * Service worker registration.
 *
 * Registers `/sw.js` after the page has loaded so SW install never competes
 * with first paint. Skipped on localhost dev (to avoid Vite HMR conflicts)
 * unless `?sw=1` is present in the URL for manual testing.
 */

export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  const isDev = import.meta.env.DEV;
  const forceEnable = new URLSearchParams(location.search).get("sw") === "1";
  if (isDev && !forceEnable) return;

  // Defer until after load so SW doesn't slow the first paint.
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        // If a new SW takes control, soft-reload once so users see fresh assets.
        let refreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (refreshing) return;
          refreshing = true;
          window.location.reload();
        });

        // Check for updates every hour for long-lived sessions.
        setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
      })
      .catch(() => {
        /* swallow — offline shell is best-effort */
      });
  });
}
