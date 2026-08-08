import { useMemo } from "react";
import { useWellnessProgress } from "@/hooks/useWellnessProgress";

const dayKey = (d: Date | string) => {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

const startOfWeek = (base = new Date()) => {
  const d = new Date(base);
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1; // Monday = 0
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
};

export interface WellnessAchievement {
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
  progress: number; // 0..1
}

/**
 * Derives all real wellness stats (streak, progress, achievements) for the
 * signed-in user from wellness_meditation_sessions / wellness_journal_entries /
 * wellness_usage_stats. No mock values.
 */
export const useWellnessStats = () => {
  const { sessions, journalEntries, stats, isLoading } = useWellnessProgress();

  return useMemo(() => {
    // ---- activity day set (any wellness activity counts) ----
    const dates: Date[] = [
      ...sessions.map((s) => new Date(s.created_at)),
      ...journalEntries.map((j) => new Date(j.created_at)),
      ...stats.map((s) => new Date(s.last_activity_at)),
    ];
    const daySet = new Set(dates.map(dayKey));

    // ---- current streak (counts today or yesterday as anchor) ----
    let currentStreak = 0;
    const cursor = new Date();
    if (!daySet.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (daySet.has(dayKey(cursor))) {
      currentStreak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    // ---- best streak ----
    const sortedDays = [...daySet]
      .map((k) => {
        const [y, m, d] = k.split("-").map(Number);
        return new Date(y, m - 1, d).getTime();
      })
      .sort((a, b) => a - b);
    let bestStreak = 0;
    let run = 0;
    let prev = 0;
    for (const t of sortedDays) {
      run = prev && t - prev === 86400000 ? run + 1 : 1;
      bestStreak = Math.max(bestStreak, run);
      prev = t;
    }
    bestStreak = Math.max(bestStreak, currentStreak);

    // ---- this week's active days (Mon..Sun) ----
    const weekStart = startOfWeek();
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return { date: d, active: daySet.has(dayKey(d)) };
    });

    // ---- progress numbers ----
    const completedSessions = sessions.filter((s) => s.completed);
    const sessionsCompleted = completedSessions.length;
    const secondsFromSessions = completedSessions.reduce(
      (sum, s) => sum + (s.duration_seconds || 0),
      0,
    );
    const secondsFromStats = stats.reduce(
      (sum, s) => sum + (s.total_duration_seconds || 0),
      0,
    );
    const minutesMeditated = Math.round(
      Math.max(secondsFromSessions, secondsFromStats) / 60,
    );

    const countOf = (type: string) =>
      stats.find((s) => s.activity_type === type)?.activity_count || 0;
    const secondsOf = (type: string) =>
      stats.find((s) => s.activity_type === type)?.total_duration_seconds || 0;

    const breathingCount =
      sessions.filter((s) => s.session_type === "breathing").length +
      countOf("breathing");
    const meditationCount = completedSessions.length;
    const journalCount = journalEntries.length;
    const soundSeconds =
      secondsOf("nature_sounds") +
      sessions
        .filter((s) => s.session_type === "nature_sounds")
        .reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
    const distinctTools = new Set<string>([
      ...sessions.map((s) => s.session_type),
      ...stats.map((s) => s.activity_type),
      ...(journalCount > 0 ? ["journal"] : []),
    ]);

    const clamp = (n: number) => Math.max(0, Math.min(1, n));

    const achievements: WellnessAchievement[] = [
      {
        name: "First Breath",
        icon: "🌬️",
        description: "Complete your first breathing exercise",
        unlocked: breathingCount >= 1,
        progress: clamp(breathingCount / 1),
      },
      {
        name: "3-Day Streak",
        icon: "🔥",
        description: "Maintain a 3-day wellness streak",
        unlocked: bestStreak >= 3,
        progress: clamp(bestStreak / 3),
      },
      {
        name: "Zen Master",
        icon: "🧘",
        description: "Complete 10 meditation sessions",
        unlocked: meditationCount >= 10,
        progress: clamp(meditationCount / 10),
      },
      {
        name: "Gratitude Pro",
        icon: "📝",
        description: "Write 7 journal entries",
        unlocked: journalCount >= 7,
        progress: clamp(journalCount / 7),
      },
      {
        name: "Sound Healer",
        icon: "🎵",
        description: "Listen to 5 hours of nature sounds",
        unlocked: soundSeconds >= 5 * 3600,
        progress: clamp(soundSeconds / (5 * 3600)),
      },
      {
        name: "Full Spectrum",
        icon: "🌈",
        description: "Try 6 different wellness tools",
        unlocked: distinctTools.size >= 6,
        progress: clamp(distinctTools.size / 6),
      },
    ];

    return {
      isLoading,
      currentStreak,
      bestStreak,
      weekDays,
      sessionsCompleted,
      minutesMeditated,
      journalCount,
      soundMinutes: Math.round(soundSeconds / 60),
      toolsUsed: distinctTools.size,
      achievements,
      hasActivity: daySet.size > 0,
    };
  }, [sessions, journalEntries, stats, isLoading]);
};
