/**
 * Global monkey-patch for supabase.functions.invoke
 * 
 * Two responsibilities:
 * 1. ALIAS MAP — transparently re-routes legacy function names to consolidated routers
 *    (so frontend components don't need to be modified after backend consolidation)
 * 2. ERROR HANDLING — translates "non-2xx" errors into user-friendly messages
 * 
 * Import this ONCE at app startup (main.tsx) before any component renders.
 */
import { supabase } from "@/integrations/supabase/client";

/**
 * Maps legacy function name → { target: new router name, action: action to inject }
 * 
 * When a component calls supabase.functions.invoke("create-connect-login-link"),
 * we transparently rewrite it to invoke("check-connect-status", { action: "connect_login" }).
 * 
 * This lets us consolidate dozens of edge functions into a few routers without
 * touching ~200 frontend components.
 */
const FUNCTION_ALIASES: Record<string, { target: string; action: string }> = {
  // ─── Stripe Connect & Customer Portals → check-connect-status ───
  "create-connect-login-link":          { target: "check-connect-status", action: "connect_login" },
  "best-friend-customer-portal":        { target: "check-connect-status", action: "customer_portal" },
  "companions-customer-portal":         { target: "check-connect-status", action: "customer_portal" },
  "employer-customer-portal":           { target: "check-connect-status", action: "customer_portal" },
  "f1-customer-portal":                 { target: "check-connect-status", action: "customer_portal" },
  "healthcare-customer-portal":         { target: "check-connect-status", action: "customer_portal" },
  "kids-customer-portal":               { target: "check-connect-status", action: "customer_portal" },
  "kids-story-customer-portal":         { target: "check-connect-status", action: "customer_portal" },
  "psychology-customer-portal":         { target: "check-connect-status", action: "customer_portal" },
  "customer-portal-creator":            { target: "check-connect-status", action: "customer_portal" },
};

const originalInvoke = supabase.functions.invoke.bind(supabase.functions);

supabase.functions.invoke = async function patchedInvoke(
  functionName: string,
  options?: any
): Promise<any> {
  // ─── Apply alias rewrite if mapped ───
  let targetFunction = functionName;
  let mergedOptions = options;

  const alias = FUNCTION_ALIASES[functionName];
  if (alias) {
    targetFunction = alias.target;
    mergedOptions = {
      ...(options || {}),
      body: {
        action: alias.action,
        ...(options?.body || {}),
      },
    };
    console.info(`[EdgeFn:alias] ${functionName} → ${alias.target} (action=${alias.action})`);
  }

  try {
    const result = await originalInvoke(targetFunction, mergedOptions);

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

      console.warn(`[EdgeFn:${targetFunction}]`, message);

      return {
        data: null,
        error: Object.assign(new Error(message), {
          name: "EdgeFunctionError",
        }),
      };
    }

    return result;
  } catch (networkErr: any) {
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

    console.warn(`[EdgeFn:${targetFunction}] network:`, raw);

    return {
      data: null,
      error: Object.assign(new Error(friendly), {
        name: "EdgeFunctionNetworkError",
      }),
    };
  }
} as typeof supabase.functions.invoke;

console.info("[EdgeFn] Global error handler + alias map active");
