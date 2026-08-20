import { useEffect } from "react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * All react-query keys that hold friendship-derived data across the app
 * (Wall friends page, Wall rightbar section, Friends hub widget, profiles).
 */
const FRIENDSHIP_KEYS = [
  ["friendships"],
  ["my-friends"],
  ["friend-requests"],
  ["friend-outgoing"],
  ["friend-suggestions"],
];

/** Invalidate every friendship-related query so all surfaces stay in sync. */
export function invalidateFriendshipQueries(qc: QueryClient) {
  FRIENDSHIP_KEYS.forEach((key) => qc.invalidateQueries({ queryKey: key }));
}

/**
 * Keeps friend requests / sent requests live: any insert, update or delete on
 * friendships involving the current user refreshes every friendship query.
 */
export function useFriendshipRealtime(userId: string | undefined) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`friendships-sync-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "friendships" },
        () => invalidateFriendshipQueries(qc),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, qc]);
}
