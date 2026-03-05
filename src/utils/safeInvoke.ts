import { supabase } from "@/integrations/supabase/client";

/**
 * Safely invoke a Supabase Edge Function, handling non-2xx responses gracefully.
 * 
 * The Supabase SDK wraps non-2xx responses as FunctionsHttpError, losing the
 * actual error message from the response body. This wrapper extracts the real
 * error message and returns a consistent { data, error } shape.
 */
export async function safeInvoke<T = any>(
  functionName: string,
  options?: { body?: Record<string, unknown>; headers?: Record<string, string> }
): Promise<{ data: T | null; error: string | null }> {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, options);

    if (error) {
      // Try to extract the actual error message from the FunctionsHttpError
      let message = "Service temporarily unavailable. Please try again.";
      
      try {
        // FunctionsHttpError has a context property with the response
        if (error && typeof error === "object" && "context" in error) {
          const ctx = (error as any).context;
          if (ctx && typeof ctx.json === "function") {
            const body = await ctx.json();
            if (body?.error) message = body.error;
          }
        } else if (error instanceof Error) {
          // Don't expose technical messages like "Edge Function returned a non-2xx status code"
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

    // Some functions return { error: "..." } in the body with 200 status
    if (data && typeof data === "object" && "error" in data && data.error && !("success" in data)) {
      return { data: null, error: data.error as string };
    }

    return { data: data as T, error: null };
  } catch (err) {
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
