import { supabase } from "@/integrations/supabase/client";

/**
 * Universal call into the `brand-arena-router` edge function.
 *
 * The Supabase SDK collapses non-2xx responses to a generic
 * "Edge Function returned a non-2xx status code" string and stashes the real
 * body on `error.context` (a Response). We unwrap it here so callers (and
 * `handleEdgeError`) get the typed message — `Unauthorized`,
 * `Insufficient credits`, `rate_limited`, etc. — instead of the SDK boilerplate.
 */
export async function brandArenaCall<T = any>(
  action: string,
  payload: Record<string, any> = {},
): Promise<T> {
  const { data, error } = await supabase.functions.invoke("brand-arena-router", {
    body: { action, ...payload },
  });

  if (error) {
    let msg = "request_failed";
    let status: number | undefined;
    try {
      const ctx = (error as any)?.context;
      if (ctx && typeof ctx.json === "function") {
        const body = await ctx.json();
        if (body?.error) msg = String(body.error);
        if (typeof ctx.status === "number") status = ctx.status;
      } else if (
        (error as any)?.message &&
        !String((error as any).message).includes("non-2xx")
      ) {
        msg = String((error as any).message);
      }
    } catch {
      /* fall through to generic */
    }
    const e: any = new Error(msg);
    if (status) e.status = status;
    if (/insufficient credits/i.test(msg)) e.status = 402;
    if (/unauthor/i.test(msg)) e.status = 401;
    if (/rate.?limit/i.test(msg)) e.status = 429;
    throw e;
  }

  if ((data as any)?.error) throw new Error((data as any).error);
  return data as T;
}
