import { createRoot } from "react-dom/client";
import { Component, lazy, ReactNode, Suspense } from "react";
import "./index.css";

const App = lazy(() => import("./App"));
const CookieConsentBanner = lazy(() =>
  import("./components/gdpr/CookieConsentBanner").then((module) => ({ default: module.CookieConsentBanner }))
);
const InstallPromptBanner = lazy(() =>
  import("./components/pwa/InstallPromptBanner").then((module) => ({ default: module.InstallPromptBanner }))
);

declare global {
  interface Window {
    __UNIQUE_MAIN_EXECUTED__?: boolean;
    __UNIQUE_REACT_RENDERED__?: boolean;
    __UNIQUE_ROOT__?: ReturnType<typeof createRoot>;
  }
}

// ---------------------------------------------------------------------------
// Global crash overlay: ak React app spadne pri mounte alebo neskôr nezachytenou
// chybou, namiesto bielej obrazovky sa zobrazí čitateľná hláška priamo v preview.
// ---------------------------------------------------------------------------
function showCrashOverlay(title: string, detail: string) {
  try {
    const root = document.getElementById("root");
    const html = `
      <div data-unique-crash-overlay="true" style="position:fixed;inset:0;z-index:2147483647;background:#0f0a1f;color:#fff;font-family:ui-sans-serif,system-ui,sans-serif;padding:24px;overflow:auto;">
        <div style="max-width:880px;margin:0 auto;">
          <div style="display:inline-block;padding:4px 10px;border-radius:9999px;background:#7c3aed;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;">Preview crash</div>
          <h1 style="margin:14px 0 6px;font-size:22px;font-weight:700;">${title}</h1>
          <p style="margin:0 0 16px;color:#c4b5fd;">Aplikácia spadla pri inicializácii. Detaily nižšie.</p>
          <pre style="white-space:pre-wrap;background:#1e1b3a;border:1px solid #4c1d95;padding:14px;border-radius:10px;font-size:12.5px;line-height:1.5;color:#fde68a;">${detail.replace(/[<&>]/g, c => ({"<":"&lt;","&":"&amp;",">":"&gt;"}[c]!))}</pre>
          <button onclick="window.location.reload()" style="margin-top:16px;border:0;border-radius:10px;background:#9333ea;color:#fff;padding:10px 14px;font-weight:700;cursor:pointer;">Reload preview</button>
          <p style="margin-top:14px;color:#a78bfa;font-size:13px;">Ak vidíš túto hlášku po refresh-i preview, pošli ju do chatu — viem ju opraviť.</p>
        </div>
      </div>`;
    if (root) root.innerHTML = html;
    else document.body.insertAdjacentHTML("beforeend", html);
  } catch {
    /* noop */
  }
}

function hasVisibleRootContent(root: HTMLElement): boolean {
  if (root.querySelector("[data-unique-crash-overlay]")) return true;

  const rect = root.getBoundingClientRect();
  const rootStyle = window.getComputedStyle(root);
  if (rect.width > 0 && rect.height > 0 && rootStyle.display !== "none" && rootStyle.visibility !== "hidden" && root.children.length > 0) {
    return true;
  }

  const text = (root.textContent ?? "").replace(/\s+/g, "");
  if (text.length > 3) return true;

  const visibleCandidates = root.querySelectorAll<HTMLElement | SVGElement>(
    "svg,canvas,img,video,button,a,input,textarea,select,[role='progressbar']",
  );

  return Array.from(visibleCandidates).some((element) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
  });
}

function installBlankScreenWatchdog(rootEl: HTMLElement) {
  const check = (afterMs: number) => {
    window.setTimeout(() => {
      try {
        if (!document.body.contains(rootEl) || hasVisibleRootContent(rootEl)) return;
        showCrashOverlay(
          "Blank preview detected",
          `React started, but no visible UI was rendered after ${afterMs}ms.\nRoute: ${window.location.pathname}${window.location.search}${window.location.hash}\nRoot HTML: ${rootEl.innerHTML.slice(0, 800) || "(empty)"}`,
        );
      } catch (err) {
        showCrashOverlay("Blank-screen watchdog failed", String((err as Error)?.stack || err));
      }
    }, afterMs);
  };

  check(4500);
  check(10000);
}

let reactRendered = false;

const BootFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
    <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
  </div>
);

class BootErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 text-foreground">
          <div className="max-w-lg rounded-lg border border-destructive/40 bg-card p-5 shadow-xl">
            <h1 className="text-lg font-semibold">Preview crash</h1>
            <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
              {this.state.error.stack || this.state.error.message}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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

window.__UNIQUE_MAIN_EXECUTED__ = true;
console.log("[Boot] main.tsx executing");

function boot() {
  const rootEl = document.getElementById("root");
  if (!rootEl) {
    showCrashOverlay("Missing #root element", "index.html does not contain <div id=\"root\"></div>");
    return;
  }

  installBlankScreenWatchdog(rootEl);

  const root = window.__UNIQUE_ROOT__ ?? createRoot(rootEl);
  window.__UNIQUE_ROOT__ = root;
  if (!window.__UNIQUE_REACT_RENDERED__) rootEl.innerHTML = "";
  try {
    root.render(
      <BootErrorBoundary>
        <Suspense fallback={<BootFallback />}>
          <App />
          <Suspense fallback={null}>
            <CookieConsentBanner />
            <InstallPromptBanner />
          </Suspense>
        </Suspense>
      </BootErrorBoundary>
    );
    reactRendered = true;
    window.__UNIQUE_REACT_RENDERED__ = true;
    console.log("[Boot] React render() called");
    window.setTimeout(() => {
      import("./utils/patchSupabaseFunctions").catch((err) => console.error("[Boot] edge patch failed", err));
      import("./utils/webVitals").then(({ installWebVitals }) => installWebVitals()).catch((err) => console.error("[Boot] web vitals failed", err));
      import("./utils/registerSW").then(({ registerServiceWorker }) => registerServiceWorker()).catch((err) => console.error("[Boot] service worker failed", err));
    }, 0);
  } catch (err) {
    console.error("[Boot] crash", err);
    showCrashOverlay("Boot error", String((err as Error)?.stack || err));
  }
}

boot();
