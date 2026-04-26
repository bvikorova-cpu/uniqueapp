import { createRoot } from "react-dom/client";
import "./utils/patchSupabaseFunctions"; // Global edge function error handler – must be first
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";
import { CookieConsentBanner } from "./components/gdpr/CookieConsentBanner";

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <CookieConsentBanner />
  </>
);

