import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";
import { CookieConsentBanner } from "./components/gdpr/CookieConsentBanner";

// Force clear old service workers and caches to ensure latest version loads
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
    });
  });
  
  // Clear all caches
  if ("caches" in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name);
      });
    });
  }
}

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <CookieConsentBanner />
  </>
);
