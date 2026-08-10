import { supabase } from "@/integrations/supabase/client";

/**
 * Calls the `wellness-ai` edge function and surfaces the REAL error message.
 * supabase-js masks non-2xx bodies with "Edge Function returned a non-2xx status code",
 * so we read the response body from error.context when available.
 */
export async function invokeWellnessAI<T = any>(action: string, body: Record<string, any> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke("wellness-ai", { body: { action, ...body } });
  if (error) {
    let message = error.message;
    try {
      const res = (error as any).context;
      if (res && typeof res.clone === "function") {
        const parsed = await res.clone().json();
        if (parsed?.error) message = parsed.error;
      }
    } catch { /* keep original message */ }
    throw new Error(message);
  }
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as T;
}
