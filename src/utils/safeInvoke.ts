import { supabase } from "@/integrations/supabase/client";

/**
 * Safely invoke a Supabase Edge Function, handling non-2xx responses gracefully.
 *
 * The Supabase SDK wraps non-2xx responses as FunctionsHttpError, losing the
 * actual error message from the response body. This wrapper extracts the real
 * error message and returns a consistent { data, error } shape.
 *
 * Also retries ONCE (500 ms backoff) on transient network/cold-start errors
 * (FunctionsFetchError / "Failed to send a request" / "Failed to fetch"),
 * which fixes flaky first-hit failures when an Edge Function worker is cold.
 */
export async function safeInvoke<T = any>(
  functionName: string,
  options?: { body?: Record<string, unknown>; headers?: Record<string, string> }
): Promise<{ data: T | null; error: string | null }> {
  const isTransientFetchError = (err: unknown): boolean => {
    if (!err) return false;
    const name = (err as any)?.name ?? "";
    const msg = (err instanceof Error ? err.message : String((err as any)?.message ?? "")).toLowerCase();
    return (
      name === "FunctionsFetchError" ||
      name === "TypeError" ||
      msg.includes("failed to send a request") ||
      msg.includes("failed to fetch") ||
      msg.includes("networkerror") ||
      msg.includes("load failed")
    );
  };

  const attempt = async () => supabase.functions.invoke(functionName, options);

  try {
    let { data, error } = await attempt();

    if (error && isTransientFetchError(error)) {
      await new Promise((r) => setTimeout(r, 500));
      const retried = await attempt();
      data = retried.data;
      error = retried.error;
    }

    if (error) {
      let message = "Service temporarily unavailable. Please try again.";

      try {
        if (error && typeof error === "object" && "context" in error) {
          const ctx = (error as any).context;
          if (ctx && typeof ctx.json === "function") {
            const body = await ctx.json();
            if (body?.error) message = body.error;
          }
        } else if (error instanceof Error) {
          if (!error.message.includes("non-2xx") && !error.message.includes("FunctionsHttpError")) {
            message = error.message;
          }
        }
      } catch {
        // Context already consumed or not available, use default
      }

      console.error(`[safeInvoke:${functionName}]`, message);
      return { data: null, error: message };
    }

    if (data && typeof data === "object" && "error" in data && data.error && !("success" in data)) {
      return { data: null, error: data.error as string };
    }

    return { data: data as T, error: null };
  } catch (err) {
    if (isTransientFetchError(err)) {
      try {
        await new Promise((r) => setTimeout(r, 500));
        const { data, error } = await attempt();
        if (!error) {
          if (data && typeof data === "object" && "error" in data && (data as any).error && !("success" in data)) {
            return { data: null, error: (data as any).error as string };
          }
          return { data: data as T, error: null };
        }
        const msg = error instanceof Error ? error.message : "Service temporarily unavailable. Please try again.";
        console.error(`[safeInvoke:${functionName}] retry-fail:`, msg);
        return { data: null, error: msg };
      } catch (err2) {
        const message = err2 instanceof Error ? err2.message : "Unknown error";
        console.error(`[safeInvoke:${functionName}] retry-catch:`, message);
        return { data: null, error: message };
      }
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[safeInvoke:${functionName}] catch:`, message);
    return { data: null, error: message };
  }
}

/**
 * Like safeInvoke but throws on error - for use in React Query mutationFn
 */
export async function invokeOrThrow<T = any>(
  functionName: string,
  options?: { body?: Record<string, unknown>; headers?: Record<string, string> }
): Promise<T> {
  const { data, error } = await safeInvoke<T>(functionName, options);
  if (error) throw new Error(error);
  return data as T;
}
