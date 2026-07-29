/**
 * App update watcher (isolated, framework-free).
 *
 * Problem it solves: users who keep the PWA/tab open for days keep running the
 * OLD JS bundle, so fixes shipped later look "broken" or missing for them while
 * they work fine for whoever just reloaded. This watcher periodically compares
 * the hashed entry script in `/index.html` with the one this tab booted with and
 * offers a one-tap refresh when a new build is live.
 *
 * Deliberately vanilla DOM: it must never depend on (or crash) React code.
 */

const CHECK_INTERVAL_MS = 60 * 1000; // every minute
const BANNER_ID = "unique-update-banner";

let currentEntry: string | null = null;
let bannerShown = false;
let checking = false;

function extractEntry(html: string): string | null {
  // Vite injects: <script type="module" crossorigin src="/assets/index-<hash>.js">
  const match = html.match(/<script[^>]+src="([^"]*\/assets\/index-[^"]+\.js)"/i);
  return match?.[1] ?? null;
}

function bootEntry(): string | null {
  const scripts = Array.from(document.querySelectorAll<HTMLScriptElement>('script[src*="/assets/index-"]'));
  const src = scripts[0]?.getAttribute("src");
  if (!src) return null;
  try {
    return new URL(src, window.location.origin).pathname;
  } catch {
    return src;
  }
}

function showBanner() {
  if (bannerShown || document.getElementById(BANNER_ID)) return;
  bannerShown = true;

  const bar = document.createElement("div");
  bar.id = BANNER_ID;
  bar.setAttribute("role", "status");
  bar.style.cssText = [
    "position:fixed",
    "left:50%",
    "transform:translateX(-50%)",
    "bottom:calc(env(safe-area-inset-bottom, 0px) + 84px)",
    "z-index:2147483000",
    "display:flex",
    "align-items:center",
    "gap:12px",
    "max-width:calc(100vw - 24px)",
    "padding:10px 12px 10px 16px",
    "border-radius:9999px",
    "background:linear-gradient(90deg,hsl(270 91% 55%),hsl(330 100% 60%))",
    "color:#fff",
    "font:600 13px/1.2 ui-sans-serif,system-ui,sans-serif",
    "box-shadow:0 10px 30px rgba(0,0,0,.25)",
  ].join(";");

  const text = document.createElement("span");
  text.textContent = "A new version of Unique is available";

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Refresh";
  button.style.cssText =
    "border:0;border-radius:9999px;background:rgba(255,255,255,.95);color:hsl(270 91% 40%);padding:7px 14px;font:700 13px/1 ui-sans-serif,system-ui,sans-serif;cursor:pointer;";
  button.onclick = async () => {
    button.disabled = true;
    button.textContent = "Updating…";
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch {
      /* ignore */
    }
    const url = new URL(window.location.href);
    url.searchParams.set("__v", String(Date.now()));
    window.location.replace(url.toString());
  };

  const dismiss = document.createElement("button");
  dismiss.type = "button";
  dismiss.setAttribute("aria-label", "Dismiss");
  dismiss.textContent = "✕";
  dismiss.style.cssText =
    "border:0;background:transparent;color:rgba(255,255,255,.85);font-size:14px;cursor:pointer;padding:4px;";
  dismiss.onclick = () => bar.remove();

  bar.append(text, button, dismiss);
  document.body.appendChild(bar);
}

async function checkForUpdate() {
  if (checking || bannerShown || document.hidden) return;
  checking = true;
  try {
    const res = await fetch(`/index.html?__check=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return;
    const entry = extractEntry(await res.text());
    if (!entry) return;
    if (!currentEntry) {
      currentEntry = entry;
      return;
    }
    if (entry !== currentEntry) showBanner();
  } catch {
    /* offline or transient — try again later */
  } finally {
    checking = false;
  }
}

export function installAppUpdateWatcher() {
  if (typeof window === "undefined") return;
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return;

  currentEntry = bootEntry();

  window.setInterval(checkForUpdate, CHECK_INTERVAL_MS);
  window.addEventListener("focus", () => void checkForUpdate());
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) void checkForUpdate();
  });
  window.setTimeout(() => void checkForUpdate(), 30_000);
}
