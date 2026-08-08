import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fire-and-forget wellness activity logger.
 * Works for ANY signed-in user (RLS scopes rows to auth.uid()).
 * Silently no-ops for guests so free tools never break.
 */
export const useWellnessActivity = () => {
  const queryClient = useQueryClient();

  const log = useCallback(
    async (activityType: string, durationSeconds = 0) => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const uid = session?.user?.id;
        if (!uid) return;

        const { data: existing } = await (supabase as any)
          .from("wellness_usage_stats")
          .select("id, activity_count, total_duration_seconds")
          .eq("user_id", uid)
          .eq("activity_type", activityType)
          .maybeSingle();

        if (existing) {
          await (supabase as any)
            .from("wellness_usage_stats")
            .update({
              activity_count: (existing.activity_count || 0) + 1,
              total_duration_seconds: (existing.total_duration_seconds || 0) + durationSeconds,
              last_activity_at: new Date().toISOString() })
            .eq("id", existing.id);
        } else {
          await (supabase as any)
            .from("wellness_usage_stats")
            .insert({
              user_id: uid,
              activity_type: activityType,
              activity_count: 1,
              total_duration_seconds: durationSeconds,
              last_activity_at: new Date().toISOString() });
        }

        queryClient.invalidateQueries({ queryKey: ["wellness-usage-stats"] });
      } catch (e) {
        console.error("wellness activity log failed", e);
      }
    },
    [queryClient],
  );

  return { logActivity: log };
};
