import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribes to realtime INSERTs on `posts` and `reposts`.
 * Returns a counter of new items received since the last reset, so the
 * Wall can show a "X new posts — click to refresh" banner without
 * disrupting the user's current scroll position.
 *
 * Self-authored inserts are ignored (the optimistic UI already showed them).
 */
export function useWallRealtime(currentUserId?: string | null) {
  const [newCount, setNewCount] = useState(0);
  const userIdRef = useRef(currentUserId);
  userIdRef.current = currentUserId;

  useEffect(() => {
    const channel = supabase
      .channel("wall-feed-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => {
          const authorId = (payload.new as any)?.user_id;
          if (authorId && authorId === userIdRef.current) return;
          setNewCount((c) => c + 1);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reposts" },
        (payload) => {
          const authorId = (payload.new as any)?.user_id;
          if (authorId && authorId === userIdRef.current) return;
          setNewCount((c) => c + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const reset = () => setNewCount(0);

  return { newCount, reset };
}
