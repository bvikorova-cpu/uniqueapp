// Sentry initialization — safe no-op when VITE_SENTRY_DSN is not set.
// Set the DSN in .env (or Vercel/Lovable env) as VITE_SENTRY_DSN to enable.
import * as Sentry from "@sentry/react";

const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
const ENV = (import.meta.env.MODE as string) || "development";

let initialized = false;

const STACK_OVERFLOW_RE = /Maximum call stack size exceeded/i;

// Install global handlers immediately (independent of Sentry init) so the
// upstream @supabase/phoenix recursion during realtime unsubscribe doesn't
// bubble as an unhandled rejection / error and doesn't reach Sentry at all.
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (ev) => {
    const reason: any = ev.reason;
    const msg = String(reason?.message ?? reason ?? "");
    const stack = String(reason?.stack ?? "");
    if (STACK_OVERFLOW_RE.test(msg) || STACK_OVERFLOW_RE.test(stack)) {
      ev.preventDefault();
    }
  });
  window.addEventListener("error", (ev) => {
    const msg = String(ev.message ?? "");
    const stack = String((ev.error as any)?.stack ?? "");
    if (STACK_OVERFLOW_RE.test(msg) || STACK_OVERFLOW_RE.test(stack)) {
      ev.preventDefault();
    }
  });
}

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
      "Object captured as promise rejection",
      "Failed to fetch dynamically imported module",
      /Failed to send a request to the Edge Function/i,
      // Upstream recursion in @supabase/phoenix triggered by rapid
      // realtime channel unsubscribe; ignored to avoid Sentry spam.
      /Maximum call stack size exceeded/i,
    ],
    beforeSend(event, hint) {
      // Normalise Supabase/PostgREST error objects ({code,details,hint,message})
      // so they become readable Sentry events instead of "Object captured…".
      const orig = hint?.originalException as any;
      if (
        orig &&
        typeof orig === "object" &&
        !(orig instanceof Error) &&
        "message" in orig &&
        ("code" in orig || "details" in orig || "hint" in orig)
      ) {
        const msg = String(orig.message || "Supabase error");
        event.exception = {
          values: [
            {
              type: `SupabaseError${orig.code ? `(${orig.code})` : ""}`,
              value: msg,
            },
          ],
        };
        event.extra = { ...(event.extra || {}), supabase: orig };
      }
      return event;
    },
  });

  initialized = true;
}

export { Sentry };
