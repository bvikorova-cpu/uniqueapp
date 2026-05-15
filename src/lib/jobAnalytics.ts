import { supabase } from "@/integrations/supabase/client";

export type JobEventType = "view" | "impression" | "apply_start" | "apply_complete" | "save" | "share";

export async function trackJobEvent(jobId: string, eventType: JobEventType, source?: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("job_analytics_events").insert({
      job_id: jobId,
      event_type: eventType,
      user_id: user?.id ?? null,
      source: source ?? null,
    });
  } catch (e) {
    // best-effort, non-blocking
    console.warn("trackJobEvent failed", e);
  }
}
