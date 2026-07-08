import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface NutritionStats {
  dailyStreak: number;
  achievements: number;
  loading: boolean;
}

/**
 * Real-time nutrition dashboard stats for NutritionHub.
 * - dailyStreak: consecutive days (up to today or yesterday) with at least one food_scans row
 * - achievements: count of completed calorie_quests
 */
export function useNutritionStats(): NutritionStats {
  const [dailyStreak, setDailyStreak] = useState(0);
  const [achievements, setAchievements] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) {
        if (!cancelled) setLoading(false);
        return;
      }

      // Last 60 distinct scan dates (enough for even the longest realistic streak).
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const [{ data: scans }, { count: questCount }] = await Promise.all([
        supabase
          .from("food_scans")
          .select("scan_date")
          .eq("user_id", uid)
          .gte("scan_date", sixtyDaysAgo.toISOString().slice(0, 10))
          .order("scan_date", { ascending: false })
          .limit(200),
        supabase
          .from("calorie_quests")
          .select("id", { count: "exact", head: true })
          .eq("user_id", uid)
          .eq("status", "completed"),
      ]);

      // Compute consecutive-day streak ending today or yesterday.
      const daySet = new Set(
        (scans ?? [])
          .map((r: any) => r.scan_date)
          .filter(Boolean),
      );

      let streak = 0;
      const cursor = new Date();
      // Allow the streak to still "count" if the user hasn't scanned yet today
      // but scanned yesterday — start from yesterday if today is missing.
      const todayKey = cursor.toISOString().slice(0, 10);
      if (!daySet.has(todayKey)) cursor.setDate(cursor.getDate() - 1);

      for (let i = 0; i < 60; i++) {
        const key = cursor.toISOString().slice(0, 10);
        if (daySet.has(key)) {
          streak += 1;
          cursor.setDate(cursor.getDate() - 1);
        } else {
          break;
        }
      }

      if (!cancelled) {
        setDailyStreak(streak);
        setAchievements(questCount ?? 0);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { dailyStreak, achievements, loading };
}
