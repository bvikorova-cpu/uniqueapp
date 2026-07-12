/**
 * Route pre-warming + link hover prefetch.
 *
 * Two mechanisms working together:
 *
 * 1. On idle after boot, speculatively import the JS chunks for the most
 *    common destinations across the app. This makes the FIRST navigation
 *    from wherever the user landed feel instant.
 * 2. A global pointer/touch delegation listener also prefetches whichever
 *    internal link the user is about to click, so even routes NOT in the
 *    hot list warm up the moment they intend to navigate.
 *
 * Both are gated on `navigator.onLine`, `saveData`, and `2g`/`slow-2g`.
 */

// Optional desktop-only route warmers. Keep this list intentionally tiny:
// the previous broad auto-prewarm downloaded Wall/Messenger/profile widgets
// while the user was trying to open Me, which can block mid-tier mobiles.
const HOT_ROUTES: Array<() => Promise<unknown>> = [
  () => import("@/pages/Profile"),
];

// Path prefix -> dynamic import. Used by the hover-prefetch delegator.
// Only include lightweight, high-traffic routes; heavy routes (3D, PDF,
// admin) intentionally stay cold.
const HOVER_PREFETCH: Array<[RegExp, () => Promise<unknown>]> = [
  [/^\/wall/, () => import("@/pages/Wall")],
  [/^\/messenger/, () => import("@/pages/Messenger")],
  [/^\/auth/, () => import("@/pages/Auth")],
  [/^\/notifications/, () => import("@/pages/Notifications")],
  [/^\/friends/, () => import("@/pages/Friends")],
  [/^\/profile/, () => import("@/pages/Profile")],
  [/^\/settings/, () => import("@/pages/Settings")],
  [/^\/games/, () => import("@/pages/Games")],
  [/^\/rewards/, () => import("@/pages/Rewards")],
  [/^\/ai-credits/, () => import("@/pages/AICreditsStore")],
  [/^\/dating/, () => import("@/pages/Dating")],
  [/^\/jobs/, () => import("@/pages/Jobs")],
  [/^\/marketplace/, () => import("@/pages/Marketplace")],
  [/^\/bazaar/, () => import("@/pages/Bazaar")],
  [/^\/education/, () => import("@/pages/education/EducationHub")],
];

let started = false;
let hoverInstalled = false;
const prefetched = new Set<string>();

export const prefetchProfileRoute = () => {
  if (prefetched.has("/profile")) return;
  prefetched.add("/profile");
  import("@/pages/Profile").catch(() => {});
};

function isSlowNetwork() {
  try {
    const nav = navigator as any;
    if (nav?.connection?.saveData) return true;
    const et = nav?.connection?.effectiveType as string | undefined;
    if (et === "2g" || et === "slow-2g") return true;
    if (navigator.onLine === false) return true;
  } catch {
    /* noop */
  }
  return false;
}

function prefetchForHref(href: string) {
  if (!href || prefetched.has(href)) return;
  let path = href;
  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return;
    path = url.pathname;
  } catch {
    return;
  }
  for (const [pattern, loader] of HOVER_PREFETCH) {
    if (pattern.test(path)) {
      prefetched.add(href);
      loader().catch(() => {});
      return;
    }
  }
}

function installHoverPrefetch() {
  if (hoverInstalled) return;
  hoverInstalled = true;
  const handler = (e: Event) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const anchor = target.closest?.("a[href]") as HTMLAnchorElement | null;
    if (!anchor) return;
    const href = anchor.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    prefetchForHref(href);
  };
  // pointerover covers mouse + pen; touchstart covers mobile taps before nav.
  document.addEventListener("pointerover", handler, { passive: true, capture: true });
  document.addEventListener("touchstart", handler, { passive: true, capture: true });
}

export function prewarmHotRoutes() {
  if (started || typeof window === "undefined") return;
  if (new URLSearchParams(window.location.search).has("__button_tester")) return;
  started = true;

  installHoverPrefetch();

  if (isSlowNetwork()) return;

  const isCoarsePointer = window.matchMedia?.("(pointer: coarse)").matches;
  if (isCoarsePointer) return;

  const w = window as any;
  const schedule = w.requestIdleCallback
    ? (cb: () => void) => w.requestIdleCallback(cb, { timeout: 3000 })
    : (cb: () => void) => setTimeout(cb, 1500);

  schedule(() => {
    // Fire imports in sequence with a small gap so we don't saturate the
    // network all at once on mid-tier mobiles.
    let i = 0;
    const next = () => {
      const loader = HOT_ROUTES[i++];
      if (!loader) return;
      loader().catch(() => {}).finally(() => {
        setTimeout(next, 200);
      });
    };
    next();
  });
}
