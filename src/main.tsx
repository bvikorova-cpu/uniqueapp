import { createRoot } from "react-dom/client";
import "./utils/patchSupabaseFunctions"; // Global edge function error handler – must be first
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";
import { CookieConsentBanner } from "./components/gdpr/CookieConsentBanner";
import { installWebVitals } from "./utils/webVitals";

// Real-user Web Vitals telemetry → vitals_log
installWebVitals();

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <CookieConsentBanner />
  </>
);

