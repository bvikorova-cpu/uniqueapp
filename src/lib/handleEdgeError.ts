import { toast } from "sonner";
import type { NavigateFunction } from "react-router-dom";

/**
 * Unified handler for edge function / API errors.
 * - 401 Unauthorized → prompt the user to sign in (CTA → /auth)
 * - 402 Payment Required (insufficient credits) → CTA → /ai-credits-store
 * - Anything else → generic error toast with the original message
 *
 * Returns `true` if the error was a known auth/credit error (so the caller
 * can early-return), `false` otherwise.
 */
export interface EdgeErrorOptions {
  /** Optional react-router navigate function. If omitted, falls back to `window.location.assign`. */
  navigate?: NavigateFunction;
  /** Where to send the user to sign in. Defaults to `/auth`. */
  signInPath?: string;
  /** Where to send the user to buy credits. Defaults to `/ai-credits-store`. */
  buyCreditsPath?: string;
  /** Optional context (e.g. feature name) appended to messages. */
  context?: string;
}

type AnyError = unknown;

function extractStatus(err: AnyError): number | null {
  if (!err || typeof err !== "object") return null;
  const e = err as Record<string, any>;
  // Supabase functions.invoke style: { error: { context: { status } } } or e.context?.status
  const candidates = [
    e.status,
    e.statusCode,
    e.code,
    e.context?.status,
    e.response?.status,
    e.cause?.status,
  ];
  for (const c of candidates) {
    const n = typeof c === "string" ? parseInt(c, 10) : c;
    if (typeof n === "number" && !Number.isNaN(n)) return n;
  }
  // Try parse from message: "...status 401..." or "...402..."
  const msg = typeof e.message === "string" ? e.message : "";
  const m = msg.match(/\b(401|402|403|404|429|500|502|503)\b/);
  if (m) return parseInt(m[1], 10);
  return null;
}

function extractMessage(err: AnyError): string {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (typeof err === "object") {
    const e = err as any;
    return (
      e?.context?.error ||
      e?.error?.message ||
      e?.error ||
      e?.message ||
      "Unknown error"
    );
  }
  return String(err);
}

function go(path: string, navigate?: NavigateFunction) {
  if (navigate) navigate(path);
  else if (typeof window !== "undefined") window.location.assign(path);
}

/**
 * Show a unified toast for 401/402; returns true if handled.
 */
export function handleEdgeError(err: AnyError, opts: EdgeErrorOptions = {}): boolean {
  const status = extractStatus(err);
  const msg = extractMessage(err);
  const {
    navigate,
    signInPath = "/auth",
    buyCreditsPath = "/ai-credits-store",
    context,
  } = opts;
  const ctx = context ? ` (${context})` : "";

  if (status === 401 || /unauthor/i.test(msg)) {
    toast.error(`Sign in required${ctx}`, {
      description: "You need to be signed in to use this feature.",
      action: {
        label: "Sign in",
        onClick: () => go(signInPath, navigate),
      },
    });
    return true;
  }

  if (status === 402 || /insufficient credits|not enough credits/i.test(msg)) {
    toast.error(`Not enough credits${ctx}`, {
      description: "Top up your AI credits to continue.",
      action: {
        label: "Buy credits",
        onClick: () => go(buyCreditsPath, navigate),
      },
    });
    return true;
  }

  if (status === 429 || /rate limit/i.test(msg)) {
    toast.error("Too many requests", {
      description: "Please wait a moment and try again.",
    });
    return true;
  }

  return false;
}

/**
 * Wrap a Supabase functions.invoke result and throw a normalized error
 * so handleEdgeError can detect 401/402 reliably.
 */
export function throwIfInvokeError(result: { data: any; error: any }): any {
  if (result.error) {
    const status =
      result.error?.context?.status ??
      result.error?.status ??
      (result.data?.error === "Insufficient credits" ? 402 : undefined);
    const msg =
      result.data?.error ||
      result.error?.context?.error ||
      result.error?.message ||
      "Request failed";
    const e: any = new Error(msg);
    if (status) e.status = status;
    throw e;
  }
  // Some edge functions return 200 with { error: "..." } — treat as error if present
  if (result.data && typeof result.data === "object" && result.data.error) {
    const e: any = new Error(result.data.error);
    if (/insufficient credits/i.test(result.data.error)) e.status = 402;
    if (/unauthor/i.test(result.data.error)) e.status = 401;
    throw e;
  }
  return result.data;
}
