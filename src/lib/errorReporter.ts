// Central error reporter — sends every error to Sentry (if configured)
// AND persists it into `public.client_error_events` so admins always have
// visibility, even without a Sentry DSN.
import { Sentry } from "@/lib/sentry";
import { supabase } from "@/integrations/supabase/client";

type Level = "error" | "warning" | "info";

export interface ReportOptions {
  source?: string;               // e.g. "stripe.checkout", "auth.signIn"
  level?: Level;
  context?: Record<string, unknown>;
  user_id?: string | null;
}

const seen = new Map<string, number>();
const DEDUPE_MS = 5_000;

function shouldDrop(msg: string): boolean {
  const now = Date.now();
  const last = seen.get(msg) ?? 0;
  if (now - last < DEDUPE_MS) return true;
  seen.set(msg, now);
  if (seen.size > 200) {
    const cutoff = now - DEDUPE_MS;
    for (const [k, t] of seen) if (t < cutoff) seen.delete(k);
  }
  return false;
}

function extract(err: unknown): { message: string; stack?: string } {
  if (err instanceof Error) return { message: err.message, stack: err.stack };
  if (typeof err === "string") return { message: err };
  if (err && typeof err === "object") {
    const anyErr = err as Record<string, unknown>;
    const msg =
      (anyErr.message as string) ||
      (anyErr.error_description as string) ||
      (anyErr.error as string) ||
      JSON.stringify(anyErr).slice(0, 500);
    return { message: msg, stack: anyErr.stack as string | undefined };
  }
  return { message: String(err) };
}

export async function reportError(err: unknown, opts: ReportOptions = {}) {
  const { message, stack } = extract(err);
  const source = opts.source ?? "client";
  const key = `${source}::${message}`;
  if (shouldDrop(key)) return;

  // 1) Sentry (safe no-op if DSN not set)
  try {
    Sentry.withScope((scope) => {
      scope.setTag("source", source);
      if (opts.level) scope.setLevel(opts.level);
      if (opts.context) scope.setExtras(opts.context);
      if (err instanceof Error) Sentry.captureException(err);
      else Sentry.captureMessage(message, opts.level ?? "error");
    });
  } catch {
    /* ignore */
  }

  // 2) Supabase log — always attempted
  try {
    const uid =
      opts.user_id ??
      (await supabase.auth.getUser()).data.user?.id ??
      null;
    await supabase.from("client_error_events").insert({
      level: opts.level ?? "error",
      source,
      message: message.slice(0, 2000),
      stack: stack?.slice(0, 8000),
      url: typeof window !== "undefined" ? window.location.href : null,
      route: typeof window !== "undefined" ? window.location.pathname : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      context: opts.context ?? null,
      user_id: uid,
    });
  } catch {
    /* swallow — never let reporter throw */
  }
}

const STACK_OVERFLOW_RE = /Maximum call stack size exceeded/i;

// Install global handlers ONCE.
let installed = false;
export function installGlobalErrorReporter() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (ev) => {
    const msg = String(ev.message ?? "");
    if (STACK_OVERFLOW_RE.test(msg)) return;
    void reportError(ev.error ?? new Error(msg), {
      source: "window.error",
      context: { filename: ev.filename, lineno: ev.lineno, colno: ev.colno },
    });
  });

  window.addEventListener("unhandledrejection", (ev) => {
    const reason = ev.reason;
    const msg = String(
      (reason as { message?: string })?.message ?? reason ?? "",
    );
    if (STACK_OVERFLOW_RE.test(msg)) return;
    void reportError(reason, { source: "unhandledrejection" });
  });
}
