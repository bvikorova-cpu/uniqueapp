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

const hasHash = (href: string) => {
  try {
    return !!new URL(href, window.location.origin).hash;
  } catch {
    return false;
  }
};

/**
 * Boot-level scroll reset for real route changes only.
 * Intentionally NOT listening for clicks/pointerdown — that caused the page
 * to jump to the top while the user was trying to tap buttons that aren't
 * navigation links. React Router's <ScrollToTop /> handles in-app route
 * changes; this only patches history APIs for completeness.
 */
export function installNavigationScrollReset() {
  if (typeof window === "undefined") return;
  if ((window as any).__UNIQUE_SCROLL_RESET_INSTALLED__) return;
  (window as any).__UNIQUE_SCROLL_RESET_INSTALLED__ = true;

  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  const maybeReset = (before: string) => {
    const after = window.location.href;
    if (samePathAndSearch(before, after)) return;
    if (hasHash(after)) return;
    scrollTop();
  };

  const originalPushState = window.history.pushState.bind(window.history);
  window.history.pushState = (...args: Parameters<History["pushState"]>) => {
    const before = window.location.href;
    const result = originalPushState(...args);
    maybeReset(before);
    return result;
  };

  const originalReplaceState = window.history.replaceState.bind(window.history);
  window.history.replaceState = (...args: Parameters<History["replaceState"]>) => {
    const before = window.location.href;
    const result = originalReplaceState(...args);
    maybeReset(before);
    return result;
  };

  window.addEventListener("popstate", () => {
    if (hasHash(window.location.href)) return;
    scrollTop();
  });
}
