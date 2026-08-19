import { useEffect, useState } from "react";

/**
 * Returns true while any modal/dialog/sheet overlay is open on the page.
 * Used to hide floating action buttons (Uni, translate) so they never cover
 * chat inputs or dialog actions on mobile.
 */
export function useOverlayOpen() {
  const [overlayOpen, setOverlayOpen] = useState(false);

  useEffect(() => {
    const check = () => {
      const hasDialog = document.querySelector(
        '[role="dialog"], [role="alertdialog"], [data-uni-overlay="true"]'
      );
      const locked = document.body.hasAttribute("data-scroll-locked");
      setOverlayOpen(Boolean(hasDialog) || locked);
    };

    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-scroll-locked", "role", "data-uni-overlay"],
    });
    return () => observer.disconnect();
  }, []);

  return overlayOpen;
}
