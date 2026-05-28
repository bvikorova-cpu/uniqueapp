import { supabase } from "@/integrations/supabase/client";

/**
 * Universal call into the `coloring-router` edge function.
 * Properly extracts `{ error: "..." }` body from FunctionsHttpError so the
 * caller can react to typed messages like `unauthorized`, `insufficient_credits`,
 * `rate_limited`, etc., instead of the SDK's generic "non-2xx" string.
 */
export async function coloringCall<T = any>(
  action: string,
  payload: Record<string, any> = {},
): Promise<T> {
  const { data, error } = await supabase.functions.invoke("coloring-router", {
    body: { action, ...payload },
  });

  if (error) {
    let msg = "request_failed";
    try {
      const ctx = (error as any)?.context;
      if (ctx && typeof ctx.json === "function") {
        const body = await ctx.json();
        if (body?.error) msg = String(body.error);
      } else if ((error as any)?.message && !String((error as any).message).includes("non-2xx")) {
        msg = String((error as any).message);
      }
    } catch {
      /* fall through to generic */
    }
    throw new Error(msg);
  }

  if ((data as any)?.error) throw new Error((data as any).error);
  return data as T;
}
