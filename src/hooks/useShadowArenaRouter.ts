import { supabase } from "@/integrations/supabase/client";

const isTransport = (e: unknown) => {
  const msg = (e as any)?.message;
  const name = (e as any)?.name;
  return name === "FunctionsFetchError" ||
    (typeof msg === "string" && (msg.includes("Failed to send a request") || msg.includes("Failed to fetch")));
};

export async function shadowArenaCall<T = any>(action: string, payload: Record<string, any> = {}): Promise<T> {
  let lastErr: unknown = null;

  // Cold starts / flaky mobile networks throw a transport error before the
  // function is even reached — retry twice before surfacing anything.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { data, error } = await supabase.functions.invoke("shadow-arena-router", {
        body: { action, ...payload } });
      if (error) {
        if (isTransport(error) && attempt < 2) {
          lastErr = error;
          await new Promise((r) => setTimeout(r, 700 * (attempt + 1)));
          continue;
        }
        const ctx = (error as any)?.context;
        let msg: string | undefined;
        if (ctx && typeof ctx.json === "function") {
          try { const body = await ctx.clone().json(); msg = body?.error || body?.message; } catch { /* noop */ }
        }
        throw new Error(msg || (error as any)?.message || "request_failed");
      }
      if ((data as any)?.error) throw new Error((data as any).error);
      return data as T;
    } catch (e) {
      if (isTransport(e) && attempt < 2) {
        lastErr = e;
        await new Promise((r) => setTimeout(r, 700 * (attempt + 1)));
        continue;
      }
      throw e;
    }
  }

  throw new Error(isTransport(lastErr)
    ? "Connection to Shadow Arena failed. Please check your network and try again."
    : "request_failed");
}
