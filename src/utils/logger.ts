import { supabase } from "@/integrations/supabase/client";

type Severity = "error" | "warning" | "info";

interface LogPayload {
  message: string;
  stack?: string;
  componentStack?: string;
  metadata?: Record<string, unknown>;
}

const isDev = import.meta.env.DEV;
const isButtonTesterFrame =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).has("__button_tester");

// Throttle: avoid spamming the DB if the same error fires repeatedly
const recentErrors = new Map<string, number>();
const DEDUPE_WINDOW_MS = 30_000;

function shouldThrottle(key: string): boolean {
  const now = Date.now();
  const last = recentErrors.get(key);
  if (last && now - last < DEDUPE_WINDOW_MS) return true;
  recentErrors.set(key, now);
  // Cleanup old entries
  if (recentErrors.size > 100) {
    for (const [k, t] of recentErrors) {
      if (now - t > DEDUPE_WINDOW_MS) recentErrors.delete(k);
    }
  }
  return false;
}

async function persistLog(severity: Severity, payload: LogPayload): Promise<void> {
  try {
    if (isButtonTesterFrame) return;

    const key = `${severity}:${payload.message}`;
    if (shouldThrottle(key)) return;

    const { data: { session } } = await supabase.auth.getSession();

    await (supabase.from("app_error_logs") as any).insert({
      user_id: session?.user?.id ?? null,
      severity,
      error_message: payload.message.slice(0, 2000),
      error_stack: payload.stack?.slice(0, 5000) ?? null,
      component_stack: payload.componentStack?.slice(0, 5000) ?? null,
      route: typeof window !== "undefined" ? window.location.pathname : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
      metadata: payload.metadata ?? null,
    });
  } catch {
    // Never let logging break the app
  }
}

export const logger = {
  info(message: string, metadata?: Record<string, unknown>) {
    if (isDev) console.info("[INFO]", message, metadata);
    void persistLog("info", { message, metadata });
  },
  warn(message: string, metadata?: Record<string, unknown>) {
    if (isDev) console.warn("[WARN]", message, metadata);
    void persistLog("warning", { message, metadata });
  },
  error(error: unknown, metadata?: Record<string, unknown>) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (isDev) console.error("[ERROR]", err, metadata);
    void persistLog("error", {
      message: err.message,
      stack: err.stack,
      metadata,
    });
  },
  reactError(error: Error, componentStack: string) {
    if (isDev) console.error("[REACT ERROR]", error, componentStack);
    void persistLog("error", {
      message: error.message,
      stack: error.stack,
      componentStack,
    });
  },
};

/**
 * Install global handlers for uncaught errors and unhandled promise rejections.
 * Call once at app startup.
 */
export function installGlobalErrorHandlers(): void {
  if (typeof window === "undefined") return;
  if (isButtonTesterFrame) return;

  window.addEventListener("error", (event) => {
    logger.error(event.error ?? event.message, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      type: "window.onerror",
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    logger.error(event.reason, { type: "unhandledrejection" });
  });
}
