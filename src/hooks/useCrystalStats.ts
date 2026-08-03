import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CrystalAchievement {
  id: string;
  title: string;
  desc: string;
  target: number;
  progress: number;
  unlocked: boolean;
}

export interface CrystalStatsData {
  totalReadings: number;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  avgEnergy: number;
  readingsThisWeek: number;
  lastActivity: string | null;
  achievements: CrystalAchievement[];
}

const EMPTY: CrystalStatsData = {
  totalReadings: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalPoints: 0,
  avgEnergy: 0,
  readingsThisWeek: 0,
  lastActivity: null,
  achievements: [],
};

const buildAchievements = (
  totalReadings: number,
  currentStreak: number,
  avgEnergy: number,
  totalPoints: number
): CrystalAchievement[] => {
  const defs = [
    { id: "first", title: "First Light", desc: "Complete your first AI reading", target: 1, progress: totalReadings },
    { id: "five", title: "Energy Seeker", desc: "Complete 5 AI readings", target: 5, progress: totalReadings },
    { id: "twenty", title: "Crystal Adept", desc: "Complete 20 AI readings", target: 20, progress: totalReadings },
    { id: "streak3", title: "Steady Aura", desc: "Reach a 3-day healing streak", target: 3, progress: currentStreak },
    { id: "streak7", title: "Weekly Alignment", desc: "Reach a 7-day healing streak", target: 7, progress: currentStreak },
    { id: "highenergy", title: "High Vibration", desc: "Reach an average energy level of 80", target: 80, progress: Math.round(avgEnergy) },
    { id: "points", title: "Light Keeper", desc: "Earn 200 energy points", target: 200, progress: totalPoints },
  ];
  return defs.map((d) => ({ ...d, unlocked: d.progress >= d.target }));
};

export const useCrystalStats = () => {
  const [data, setData] = useState<CrystalStatsData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) {
      setSignedIn(false);
      setData(EMPTY);
      setLoading(false);
      return;
    }
    setSignedIn(true);

    const [statsRes, readingsRes] = await Promise.all([
      supabase
        .from("crystal_user_stats")
        .select("current_streak,longest_streak,total_points,total_readings,last_activity_date")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("crystal_energy_readings")
        .select("energy_level,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

    const readings = readingsRes.data ?? [];
    const stats = statsRes.data;

    const levels = readings.map((r) => Number(r.energy_level)).filter((n) => Number.isFinite(n) && n > 0);
    const avgEnergy = levels.length ? levels.reduce((a, b) => a + b, 0) / levels.length : 0;

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const readingsThisWeek = readings.filter((r) => r.created_at && new Date(r.created_at).getTime() >= weekAgo).length;

    const totalReadings = stats?.total_readings ?? readings.length;
    const currentStreak = stats?.current_streak ?? 0;
    const totalPoints = stats?.total_points ?? 0;

    setData({
      totalReadings,
      currentStreak,
      longestStreak: stats?.longest_streak ?? 0,
      totalPoints,
      avgEnergy,
      readingsThisWeek,
      lastActivity: stats?.last_activity_date ?? readings[0]?.created_at ?? null,
      achievements: buildAchievements(totalReadings, currentStreak, avgEnergy, totalPoints),
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("crystal-stats-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "crystal_user_stats" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "crystal_energy_readings" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  return { ...data, loading, signedIn, refresh: load };
};
