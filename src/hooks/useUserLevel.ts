import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserLevel {
  level: number;
  totalPoints: number;
  currentLevelPoints: number;
  nextLevelAt: number;
  progressPct: number;
}

const POINTS_PER_LEVEL = (lvl: number) => 100 + lvl * 50;

export function useUserLevel(userId?: string) {
  const [data, setData] = useState<UserLevel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      let uid = userId;
      if (!uid) {
        const { data: u } = await supabase.auth.getUser();
        uid = u.user?.id;
      }
      if (!uid) { setLoading(false); return; }
      const { data: row } = await supabase
        .from("user_points")
        .select("level,total_points,current_level_points")
        .eq("user_id", uid)
        .maybeSingle();
      if (!active) return;
      const level = row?.level ?? 1;
      const total = row?.total_points ?? 0;
      const cur = row?.current_level_points ?? 0;
      const nextAt = POINTS_PER_LEVEL(level);
      setData({
        level,
        totalPoints: total,
        currentLevelPoints: cur,
        nextLevelAt: nextAt,
        progressPct: Math.min(100, Math.round((cur / nextAt) * 100)),
      });
      setLoading(false);
    })();
    return () => { active = false; };
  }, [userId]);

  return { data, loading };
}
