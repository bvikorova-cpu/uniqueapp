import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface WallStats {
  postsToday: number;
  activeUsers: number;
  interactionsToday: number;
  streak: number;
}

export function useWallStats(userId?: string | null) {
  const [stats, setStats] = useState<WallStats>({
    postsToday: 0,
    activeUsers: 0,
    interactionsToday: 0,
    streak: 0,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
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
        const { data } = await supabase.rpc("compute_xp_streak", { _user_id: userId } as any);
        if (typeof data === "number") streak = data;
      }

      if (cancelled) return;
      setStats({
        postsToday: postsRes.count ?? 0,
        activeUsers: (activeRes.count ?? 0) || (usersRes.count ?? 0),
        interactionsToday: (likesRes.count ?? 0) + (commentsRes.count ?? 0),
        streak,
      });
    };

    load();
    const t = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [userId]);

  return stats;
}
