import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls the window to the top on route/subsection changes.
 * Also disables browser scroll restoration so mobile browsers don't keep the
 * previous footer position when opening a new page from the bottom of a page.
 */
const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    let raf = 0;
    let timeout = 0;

    const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    if (hash) {
      raf = window.requestAnimationFrame(() => {
        const el = document.getElementById(hash.slice(1));
        if (el) {
          el.scrollIntoView({ block: "start", behavior: "auto" });
        } else {
          scrollToTop();
        }
      });

      return () => {
        window.cancelAnimationFrame(raf);
      };
    }

    scrollToTop();
    raf = window.requestAnimationFrame(scrollToTop);
    const timeouts = [60, 180, 450, 900].map((delay) => window.setTimeout(scrollToTop, delay));

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
      timeouts.forEach(window.clearTimeout);
    };
  }, [pathname, search, hash]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const link = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target || link.hasAttribute("download")) return;

      const nextUrl = new URL(link.href, window.location.href);
      if (nextUrl.origin !== window.location.origin) return;

      if (!nextUrl.hash) {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        window.setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }), 0);
        return;
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
};

export default ScrollToTop;
