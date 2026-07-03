/**
 * Route pre-warming.
 *
 * When the user has been idle on the current page for a moment, we speculatively
 * fetch the JS chunks for the most likely next destinations. This turns
 * subsequent navigations into a paint-in-the-next-frame experience instead of
 * a spinner + waterfall.
 *
 * Rules:
 *  - Only run once per session.
 *  - Only run on `navigator.onLine` and when the connection isn't Save-Data
 *    or a documented `2g`/`slow-2g` — mobile users on tight networks pay for
 *    every byte.
 *  - Use `requestIdleCallback` with a generous timeout so we never compete
 *    with the current page's own critical work.
 */

const HOT_ROUTES: Array<() => Promise<unknown>> = [
  () => import("@/pages/Wall"),
  () => import("@/pages/Messenger"),
  () => import("@/pages/Auth"),
  () => import("@/pages/Notifications"),
  () => import("@/pages/Friends"),
];

let started = false;

export function prewarmHotRoutes() {
  if (started || typeof window === "undefined") return;
  started = true;

  try {
    const nav = navigator as any;
    if (nav?.connection?.saveData) return;
    const et = nav?.connection?.effectiveType as string | undefined;
    if (et === "2g" || et === "slow-2g") return;
    if (navigator.onLine === false) return;
  } catch {
    /* noop */
  }

  const w = window as any;
  const schedule = w.requestIdleCallback
    ? (cb: () => void) => w.requestIdleCallback(cb, { timeout: 4000 })
    : (cb: () => void) => setTimeout(cb, 2500);

  schedule(() => {
    // Fire imports in sequence with a small gap so we don't saturate the
    // network all at once on mid-tier mobiles.
    let i = 0;
    const next = () => {
      const loader = HOT_ROUTES[i++];
      if (!loader) return;
      loader().catch(() => {}).finally(() => {
        setTimeout(next, 350);
      });
    };
    next();
  });
}
