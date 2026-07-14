// Sentry initialization — safe no-op when VITE_SENTRY_DSN is not set.
// Set the DSN in .env (or Vercel/Lovable env) as VITE_SENTRY_DSN to enable.
import * as Sentry from "@sentry/react";

const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
const ENV = (import.meta.env.MODE as string) || "development";

let initialized = false;

export function initSentry() {
  if (initialized) return;
  if (!DSN) {
    // eslint-disable-next-line no-console
    console.info("[Sentry] disabled — set VITE_SENTRY_DSN to enable");
    return;
  }
  Sentry.init({
    dsn: DSN,
    environment: ENV,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    tracesSampleRate: ENV === "production" ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.0,
    replaysOnErrorSampleRate: 1.0,
    ignoreErrors: [
      "ResizeObserver loop",
      "Non-Error promise rejection captured",
      "Failed to fetch dynamically imported module",
      /Failed to send a request to the Edge Function/i,
    ],
  });
  initialized = true;
}

export { Sentry };
