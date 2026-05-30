import { supabase } from "@/integrations/supabase/client";

export type JobEventType = "view" | "impression" | "apply_start" | "apply_complete" | "save" | "share";

// Client-side dedup (per tab) to avoid spamming the DB; the DB trigger is the source of truth.
const recent = new Map<string, number>();
const DEDUP_MS = 60 * 60 * 1000;

export async function trackJobEvent(jobId: string, eventType: JobEventType, source?: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // anonymous tracking blocked server-side; bail to avoid noisy 403s.
    const key = `${user.id}:${jobId}:${eventType}`;
    const last = recent.get(key) ?? 0;
    if (Date.now() - last < DEDUP_MS) return;
    recent.set(key, Date.now());
    await (supabase as any).from("job_analytics_events").insert({
      job_id: jobId,
      event_type: eventType,
      user_id: user.id,
      source: source ?? null,
    });
  } catch (e) {
    // Trigger may silently drop dups (returns NULL); ignore errors entirely.
  }
}
