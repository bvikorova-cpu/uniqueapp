import { createRoot } from "react-dom/client";
import "./utils/patchSupabaseFunctions"; // Global edge function error handler – must be first
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";
import { CookieConsentBanner } from "./components/gdpr/CookieConsentBanner";
import { InstallPromptBanner } from "./components/pwa/InstallPromptBanner";
import { installWebVitals } from "./utils/webVitals";
import { registerServiceWorker } from "./utils/registerSW";

// Real-user Web Vitals telemetry → vitals_log
installWebVitals();
// PWA offline shell + asset cache
registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <CookieConsentBanner />
    <InstallPromptBanner />
  </>
);

