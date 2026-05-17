import { supabase } from "@/integrations/supabase/client";

export async function shadowArenaCall<T = any>(action: string, payload: Record<string, any> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke("shadow-arena-router", {
    body: { action, ...payload },
  });
  if (error) {
    const msg = (error as any)?.context?.error || (error as any)?.message || "request_failed";
    throw new Error(msg);
  }
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as T;
}
