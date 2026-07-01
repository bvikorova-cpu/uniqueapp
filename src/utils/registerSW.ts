/**
 * Service worker registration.
 *
 * Registers `/sw.js` after the page has loaded so SW install never competes
 * with first paint. Skipped on localhost dev (to avoid Vite HMR conflicts)
 * unless `?sw=1` is present in the URL for manual testing.
 */

export function registerServiceWorker() {
  // TEMPORARILY DISABLED. A previous SW version cached navigation HTML and
  // trapped users on a stale loader screen. We now ship a kill-switch SW
  // (public/sw.js) that unregisters itself, and index.html proactively wipes
  // any existing registrations on every page load. Do not re-register a SW
  // here until the offline-shell strategy has been fully redesigned.
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker
    .getRegistrations()
    .then((regs) => regs.forEach((r) => r.unregister().catch(() => {})))
    .catch(() => {});
}
