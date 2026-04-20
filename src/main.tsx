import { createRoot } from "react-dom/client";
import "./utils/patchSupabaseFunctions"; // Global edge function error handler – must be first
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";
import { CookieConsentBanner } from "./components/gdpr/CookieConsentBanner";

/**
 * Prevent preview from getting stuck on a previously cached PWA build.
 * We clear SW + Cache Storage once per version and then do a single hard reload.
 */
const CACHE_BUST_VERSION = "2026-04-20a"; // MUST match index.html `v` param to avoid redirect loops

(async () => {
  try {
    const key = `sw_cache_cleared_${CACHE_BUST_VERSION}`;

    // Always force a versioned URL so CDN/proxy caches can't keep serving an old /index.html.
    // (Most caches key by the full URL including querystring.)
    const url = new URL(window.location.href);
    const currentV = url.searchParams.get("v");
    const needsVersionedUrl = currentV !== CACHE_BUST_VERSION;

    // If we've already purged for this version AND we're already on the versioned URL, do nothing.
    if (localStorage.getItem(key) === "1" && !needsVersionedUrl) return;

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

    // Reload once to pick up the fresh build OR to ensure we're on the versioned URL.
    if (didSomething || needsVersionedUrl) {
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

