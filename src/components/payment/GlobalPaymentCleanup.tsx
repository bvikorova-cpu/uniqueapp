import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

/**
 * Global cleanup of leftover Stripe redirect params.
 *
 * The per-page verify hooks (useOneOffPaymentVerify) already strip
 * `session_id` / `success` / `payment` when they fire. This component is the
 * safety net for two cases:
 *   1. User cancels Stripe → lands on a page that has no verify hook
 *      (e.g. `/?payment=canceled`).
 *   2. Stripe redirects to a page that lost its verify hook in a refactor.
 *
 * Runs after a 2s grace period so legitimate verify hooks get to read the
 * params first. Only touches URL when known leftover params are still there.
 */
export function GlobalPaymentCleanup() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (!search.includes("payment=") && !search.includes("session_id=")) return;

    const t = window.setTimeout(() => {
      const url = new URL(window.location.href);
      let touched = false;
      for (const key of ["session_id", "success", "payment"]) {
        if (url.searchParams.has(key)) {
          url.searchParams.delete(key);
          touched = true;
        }
      }
      if (touched) {
        window.history.replaceState({}, "", url.pathname + url.search);
      }
    }, 2000);

    return (
    <>
      <FloatingHowItWorks title={"Global Payment Cleanup - How it works"} steps={[{ title: 'Open', desc: 'Access the Global Payment Cleanup section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Global Payment Cleanup.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => window.clearTimeout(t);
  }, [pathname, search]);

  return null;
}
