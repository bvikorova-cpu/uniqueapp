const scrollTop = () => {
  try {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  } catch {
    /* noop */
  }
};

const samePathAndSearch = (before: string, after: string) => {
  try {
    const prev = new URL(before, window.location.origin);
    const next = new URL(after, window.location.origin);
    return prev.pathname === next.pathname && prev.search === next.search;
  } catch {
    return before === after;
  }
};

export function installNavigationScrollReset() {
  if (typeof window === "undefined") return;
  if ((window as any).__UNIQUE_SCROLL_RESET_INSTALLED__) return;
  (window as any).__UNIQUE_SCROLL_RESET_INSTALLED__ = true;

  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  const resetSoon = () => {
    scrollTop();
    window.requestAnimationFrame(scrollTop);
    [0, 80, 220, 600].forEach((delay) => window.setTimeout(scrollTop, delay));
  };

  const originalPushState = window.history.pushState.bind(window.history);
  window.history.pushState = (...args: Parameters<History["pushState"]>) => {
    const before = window.location.href;
    const result = originalPushState(...args);
    if (!samePathAndSearch(before, window.location.href)) resetSoon();
    return result;
  };

  const originalReplaceState = window.history.replaceState.bind(window.history);
  window.history.replaceState = (...args: Parameters<History["replaceState"]>) => {
    const before = window.location.href;
    const result = originalReplaceState(...args);
    if (!samePathAndSearch(before, window.location.href)) resetSoon();
    return result;
  };

  window.addEventListener("popstate", resetSoon);

  const handleIntent = (event: MouseEvent | PointerEvent | TouchEvent) => {
    if ("button" in event && event.button !== 0) return;
    if ("metaKey" in event && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;

    const target = event.target as Element | null;
    const link = target?.closest("a[href]") as HTMLAnchorElement | null;
    if (!link || link.target || link.hasAttribute("download")) return;

    const next = new URL(link.href, window.location.href);
    if (next.origin !== window.location.origin || next.hash) return;
    resetSoon();
  };

  document.addEventListener("pointerdown", handleIntent, true);
  document.addEventListener("touchstart", handleIntent, true);
  document.addEventListener("click", handleIntent, true);
}