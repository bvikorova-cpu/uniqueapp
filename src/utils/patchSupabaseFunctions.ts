/**
 * Global monkey-patch for supabase.functions.invoke
 * 
 * This intercepts ALL calls to supabase.functions.invoke across the entire app
 * and wraps them with robust error handling so that:
 * 1. "non-2xx" errors are caught and translated to user-friendly messages
 * 2. The actual error message from the response body is extracted
 * 3. Network/CORS/timeout errors are gracefully handled
 * 4. The original { data, error } contract is preserved
 * 
 * Import this ONCE at app startup (main.tsx) before any component renders.
 */
import { supabase } from "@/integrations/supabase/client";

const originalInvoke = supabase.functions.invoke.bind(supabase.functions);

supabase.functions.invoke = async function patchedInvoke(
  functionName: string,
  options?: any
): Promise<any> {
  try {
    const result = await originalInvoke(functionName, options);

    if (result.error) {
      let message = "Service temporarily unavailable. Please try again.";

      try {
        const err = result.error;

        // FunctionsHttpError – extract real message from response context
        if (err && typeof err === "object" && "context" in err) {
          const ctx = (err as any).context;
          if (ctx && typeof ctx.json === "function") {
            const body = await ctx.json();
            if (body?.error) message = body.error;
            else if (body?.message) message = body.message;
          }
        } else if (err instanceof Error) {
          // Keep meaningful messages, replace generic "non-2xx" noise
          if (
            !err.message.includes("non-2xx") &&
            !err.message.includes("FunctionsHttpError") &&
            !err.message.includes("FunctionsRelayError")
          ) {
            message = err.message;
          }
        }
      } catch {
        // Context stream already consumed or unavailable – keep default
      }

      console.warn(`[EdgeFn:${functionName}]`, message);

      // Return a synthetic error object that behaves like the original
      return {
        data: null,
        error: Object.assign(new Error(message), {
          // Preserve .message for code that checks error.message
          name: "EdgeFunctionError",
        }),
      };
    }

    return result;
  } catch (networkErr: any) {
    // Network failures, CORS issues, timeouts
    const raw = networkErr?.message || "Network error";
    let friendly: string;

    if (raw.includes("Failed to fetch") || raw.includes("NetworkError")) {
      friendly = "Network error. Please check your connection and try again.";
    } else if (raw.includes("AbortError") || raw.includes("timeout")) {
      friendly = "Request timed out. Please try again.";
    } else if (raw.includes("CORS")) {
      friendly = "Connection blocked. Please try again later.";
    } else {
      friendly = "Service temporarily unavailable. Please try again.";
    }

    console.warn(`[EdgeFn:${functionName}] network:`, raw);

    return {
      data: null,
      error: Object.assign(new Error(friendly), {
        name: "EdgeFunctionNetworkError",
      }),
    };
  }
} as typeof supabase.functions.invoke;

// Signal that the patch has been applied
console.info("[EdgeFn] Global error handler active");
