/**
 * Lazy Google Fonts loader.
 *
 * Render-blocking @import in index.css used to fetch 4 niche font families
 * (Dancing Script, Cinzel, Creepster, Crimson Pro) on every page — including
 * the landing page where none of them are visible. PageSpeed measured this as
 * ~750 ms of FCP/LCP delay on mobile.
 *
 * Components that actually need those fonts now call loadGoogleFont(key) on
 * mount; the stylesheet is injected once and cached.
 */

const FONT_URLS: Record<string, string> = {
  signature:
    "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap",
  gothic:
    "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Creepster&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap",
};

const loaded = new Set<string>();

export function loadGoogleFont(key: keyof typeof FONT_URLS) {
  if (typeof document === "undefined") return;
  if (loaded.has(key)) return;
  const href = FONT_URLS[key];
  if (!href) return;
  loaded.add(key);

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);
}
