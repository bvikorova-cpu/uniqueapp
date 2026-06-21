import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * "New posts" indicator for the Wall.
 *
 * SCALE NOTE: Subscribing to *every* INSERT on `posts`/`reposts` via Supabase
 * Realtime is a fan-out firehose — every connected browser would receive every
 * post in the system. At 10k+ DAU this becomes the #1 cost driver and quickly
 * exhausts Realtime channel quotas.
 *
 * Instead we poll a cheap `count(*)` on a 30s interval; the user only sees the
 * banner when there is actually something new since the last reset. This scales
 * to millions of concurrent users without touching Realtime infra.
 */
export function useWallRealtime(_currentUserId?: string | null) {
  const [newCount, setNewCount] = useState(0);
  const baselineRef = useRef<string>(new Date().toISOString());

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const { count } = await supabase
          .from("posts")
          .select("id", { count: "exact", head: true })
          .gt("created_at", baselineRef.current);
        if (!cancelled && typeof count === "number") setNewCount(count);
      } catch { /* swallow */ }
    };
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => { cancelled = true; window.clearInterval(id); };
  }, []);

  const reset = () => {
    baselineRef.current = new Date().toISOString();
    setNewCount(0);
  };

  return { newCount, reset };
}
