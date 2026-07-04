import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls the window to the top on route/subsection changes.
 * Also disables browser scroll restoration so mobile browsers don't keep the
 * previous footer position when opening a new page from the bottom of a page.
 */
const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    let raf = 0;

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
      timeouts.forEach(window.clearTimeout);
    };
  }, [pathname, search, hash]);

  return null;
};

export default ScrollToTop;
