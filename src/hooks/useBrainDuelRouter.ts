import { supabase } from "@/integrations/supabase/client";

export async function brainDuelCall<T = any>(action: string, payload: Record<string, any> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke("brain-duel-router", {
    body: { action, ...payload } });
  if (error) {
    const context = (error as any)?.context;
    let status = (error as any)?.status || context?.status;
    let msg = (error as any)?.message || "request_failed";
    if (context instanceof Response) {
      status = context.status;
      const body = await context.clone().json().catch(() => null);
      msg = body?.error || msg;
    } else if (context?.error) {
      msg = context.error;
    }
    const normalized: any = new Error(msg);
    if (status) normalized.status = status;
    throw normalized;
  }
  if ((data as any)?.error) {
    const normalized: any = new Error((data as any).error);
    if (/insufficient credits/i.test((data as any).error)) normalized.status = 402;
    if (/unauthor/i.test((data as any).error)) normalized.status = 401;
    throw normalized;
  }
  return data as T;
}
