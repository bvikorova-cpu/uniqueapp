import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Activity types the engagement dashboard knows about.
 *
 * IMPORTANT: most user actions are tracked automatically by database
 * triggers (see migration `activity_feed_auto_tracking_triggers`):
 *   - posts INSERT          → post_created
 *   - post_likes INSERT     → post_liked
 *   - post_comments INSERT  → post_commented
 *   - user_follows INSERT   → friend_added
 *
 * Use this hook ONLY for actions that don't have a single backing table
 * insert (e.g. profile updates that happen client-side, photo uploads
 * that flow through Storage, post share buttons that don't persist).
 *
 * Calls are best-effort and never throw — a failed log must not break
 * the user-facing action.
 */
export type TrackedActivityType =
  | "profile_updated"
  | "photo_uploaded"
  | "post_shared"
  | "story_viewed"
  | "session_started";

interface TrackOptions {
  targetId?: string;
  targetType?: string;
  metadata?: Record<string, unknown>;
}

export function useTrackActivity() {
  const track = useCallback(
    async (activityType: TrackedActivityType, options: TrackOptions = {}) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from("activity_feed").insert({
          user_id: user.id,
          activity_type: activityType,
          target_id: options.targetId ?? null,
          target_type: options.targetType ?? null,
          metadata: (options.metadata ?? {}) as never,
        });
      } catch {
        // Logging must never break the calling action.
      }
    },
    []
  );

  return { track };
}
