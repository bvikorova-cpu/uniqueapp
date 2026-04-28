import { createRoot } from "react-dom/client";
import "./utils/patchSupabaseFunctions"; // Global edge function error handler – must be first
import "./index.css";
import "./i18n/config";
import { installWebVitals } from "./utils/webVitals";
import { registerServiceWorker } from "./utils/registerSW";

// ---------------------------------------------------------------------------
// Global crash overlay: ak React app spadne pri mounte alebo neskôr nezachytenou
// chybou, namiesto bielej obrazovky sa zobrazí čitateľná hláška priamo v preview.
// ---------------------------------------------------------------------------
function showCrashOverlay(title: string, detail: string) {
  try {
    const root = document.getElementById("root");
    const html = `
      <div style="position:fixed;inset:0;z-index:2147483647;background:#0f0a1f;color:#fff;font-family:ui-sans-serif,system-ui,sans-serif;padding:24px;overflow:auto;">
        <div style="max-width:880px;margin:0 auto;">
          <div style="display:inline-block;padding:4px 10px;border-radius:9999px;background:#7c3aed;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;">Preview crash</div>
          <h1 style="margin:14px 0 6px;font-size:22px;font-weight:700;">${title}</h1>
          <p style="margin:0 0 16px;color:#c4b5fd;">Aplikácia spadla pri inicializácii. Detaily nižšie.</p>
          <pre style="white-space:pre-wrap;background:#1e1b3a;border:1px solid #4c1d95;padding:14px;border-radius:10px;font-size:12.5px;line-height:1.5;color:#fde68a;">${detail.replace(/[<&>]/g, c => ({"<":"&lt;","&":"&amp;",">":"&gt;"}[c]!))}</pre>
          <p style="margin-top:14px;color:#a78bfa;font-size:13px;">Ak vidíš túto hlášku po refresh-i preview, pošli ju do chatu — viem ju opraviť.</p>
        </div>
      </div>`;
    if (root) root.innerHTML = html;
    else document.body.insertAdjacentHTML("beforeend", html);
  } catch {
    /* noop */
  }
}

let reactRendered = false;

const BootLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6 text-center">
    <div>
      <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      <p className="text-base font-semibold">Unique sa načítava…</p>
      <p className="mt-2 text-sm text-muted-foreground">Pripravujem tvoju reláciu.</p>
    </div>
  </div>
);

window.addEventListener("error", (e) => {
  console.error("[GlobalError]", e.error || e.message);
  if (!reactRendered) {
    showCrashOverlay(e.message || "Unhandled error", String(e.error?.stack || e.error || e.message));
  }
});
window.addEventListener("unhandledrejection", (e) => {
  console.error("[UnhandledRejection]", e.reason);
  if (!reactRendered) {
    showCrashOverlay("Unhandled promise rejection", String(e.reason?.stack || e.reason));
  }
});

console.log("[Boot] main.tsx executing");

async function boot() {
  // Real-user Web Vitals telemetry → vitals_log
  installWebVitals();
  const rootEl = document.getElementById("root");
  if (!rootEl) {
    showCrashOverlay("Missing #root element", "index.html does not contain <div id=\"root\"></div>");
    return;
  }

  rootEl.innerHTML = "";
  const root = createRoot(rootEl);
  root.render(<BootLoader />);

  try {
    const [{ default: App }, { CookieConsentBanner }, { InstallPromptBanner }] = await Promise.all([
      import("./App.tsx"),
      import("./components/gdpr/CookieConsentBanner"),
      import("./components/pwa/InstallPromptBanner"),
    ]);

    root.render(
      <>
        <App />
        <CookieConsentBanner />
        <InstallPromptBanner />
      </>
    );
    reactRendered = true;
    console.log("[Boot] React render() called");
    // PWA offline shell + asset cache: register až po prvom React renderi,
    // aby service worker nikdy nezablokoval prázdny preview mount.
    registerServiceWorker();
  } catch (err) {
    console.error("[Boot] crash", err);
    showCrashOverlay("Boot error", String((err as Error)?.stack || err));
  }
}

void boot();
