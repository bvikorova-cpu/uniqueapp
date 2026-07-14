import { Sentry } from "@/lib/sentry";

/**
 * TEMPORARY: floating button to verify Sentry is capturing events.
 * Remove this component (and its mount in main.tsx) once verified.
 */
export function SentryTestButton() {
  const throwError = () => {
    // Also send an explicit captureException so it arrives even if the global
    // handler is filtered somewhere upstream.
    try {
      Sentry.captureException(new Error("Sentry test — manual throw from UI button"));
    } catch {
      /* noop */
    }
    // Then throw for real so Sentry's global handler picks it up too.
    setTimeout(() => {
      throw new Error("Sentry test — manual throw from UI button");
    }, 0);
  };

  return (
    <button
      type="button"
      onClick={throwError}
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 2147483000,
        padding: "10px 14px",
        borderRadius: 9999,
        background: "#dc2626",
        color: "#fff",
        fontWeight: 700,
        fontSize: 13,
        border: 0,
        boxShadow: "0 6px 20px rgba(220,38,38,0.4)",
        cursor: "pointer",
      }}
      aria-label="Throw test error to Sentry"
    >
      🧪 Throw test error
    </button>
  );
}
