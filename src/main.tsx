import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";
import { CookieConsentBanner } from "./components/gdpr/CookieConsentBanner";

/**
 * Prevent preview from getting stuck on a previously cached PWA build.
 * We clear SW + Cache Storage once per version and then do a single hard reload.
 */
const CACHE_BUST_VERSION = "2025-12-26a";

(async () => {
  try {
    const key = `sw_cache_cleared_${CACHE_BUST_VERSION}`;
    if (localStorage.getItem(key) === "1") return;

    let didSomething = false;

    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      if (regs.length > 0) {
        await Promise.all(regs.map((r) => r.unregister()));
        didSomething = true;
      }
    }

    if ("caches" in window) {
      const names = await caches.keys();
      if (names.length > 0) {
        await Promise.all(names.map((n) => caches.delete(n)));
        didSomething = true;
      }
    }

    localStorage.setItem(key, "1");

    // If we actually removed a SW/cache, reload once to pick up the fresh build.
    if (didSomething) {
      const url = new URL(window.location.href);
      url.searchParams.set("v", CACHE_BUST_VERSION);
      window.location.replace(url.toString());
    }
  } catch {
    // If this fails, don't block app startup.
  }
})();

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <CookieConsentBanner />
  </>
);

