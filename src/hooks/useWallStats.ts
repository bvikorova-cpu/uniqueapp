import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface WallStats {
  postsToday: number;
  activeUsers: number;
  interactionsToday: number;
  streak: number;
}

// Lightweight module-level cache so multiple mounts / remounts don't refetch
let statsCache: { data: WallStats; at: number; userId?: string | null } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export function useWallStats(userId?: string | null, enabled = true) { const [stats, setStats] = useState<WallStats>({
    postsToday: 0,
    activeUsers: 0,
    interactionsToday: 0,
    streak: 0 });

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const load = async (force = false) => {
      if (!force && statsCache && statsCache.userId === userId && Date.now() - statsCache.at < CACHE_TTL) {
        setStats(statsCache.data);
        return;
      }
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const iso = startOfDay.toISOString();
      const since15m = new Date(Date.now() - 15 * 60 * 1000).toISOString();

      const [postsRes, usersRes, likesRes, commentsRes, activeRes] = await Promise.all([
        supabase.from("posts").select("id", { count: "exact", head: true }).gte("created_at", iso),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("post_likes").select("id", { count: "exact", head: true }).gte("created_at", iso),
        supabase.from("post_comments").select("id", { count: "exact", head: true }).gte("created_at", iso),
        supabase.from("user_activity").select("user_id", { count: "exact", head: true }).gte("last_seen", since15m),
      ]);

      let streak = 0;
      if (userId) {
        const { data } = await supabase
          .from("user_streaks")
          .select("current_streak")
          .eq("user_id", userId)
          .maybeSingle();
        streak = (data as { current_streak?: number } | null)?.current_streak ?? 0;
      }


      const next: WallStats = { postsToday: postsRes.count ?? 0,
        activeUsers: (activeRes.count ?? 0) || (usersRes.count ?? 0),
        interactionsToday: (likesRes.count ?? 0) + (commentsRes.count ?? 0),
        streak };
      statsCache = { data: next, at: Date.now(), userId };
      if (cancelled) return;
      setStats(next);
    };

    load();
    const t = setInterval(() => load(true), CACHE_TTL);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [userId, enabled]);

  return stats;
}
