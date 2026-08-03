import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MysticalAchievement {
  id: string;
  label: string;
  icon: string;
  unlocked: boolean;
}

const TABLES = [
  "tarot_readings",
  "daily_horoscopes",
  "dream_interpretations",
  "rune_readings",
  "birth_charts",
] as const;

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

/** Real mystical streak + achievements derived from the user's reading history. */
export const useMysticalStats = () => {
  const query = useQuery({
    queryKey: ["mystical-stats"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { streak: 0, total: 0, counts: {} as Record<string, number>, achievements: [] as MysticalAchievement[] };
      }

      const since = new Date();
      since.setDate(since.getDate() - 90);

      const results = await Promise.all(
        TABLES.map((t) =>
          (supabase as any)
            .from(t)
            .select("created_at")
            .eq("user_id", user.id)
            .gte("created_at", since.toISOString())
            .order("created_at", { ascending: false })
            .limit(500),
        ),
      );

      const counts: Record<string, number> = {};
      const daySet = new Set<string>();
      let total = 0;

      results.forEach((res: any, i) => {
        const rows = res?.data ?? [];
        counts[TABLES[i]] = rows.length;
        total += rows.length;
        rows.forEach((r: any) => {
          if (r?.created_at) daySet.add(dayKey(new Date(r.created_at)));
        });
      });

      // Consecutive-day streak ending today (or yesterday if nothing yet today).
      const cursor = new Date();
      if (!daySet.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
      let streak = 0;
      for (let i = 0; i < 90; i++) {
        if (!daySet.has(dayKey(cursor))) break;
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      }

      const achievements: MysticalAchievement[] = [
        { id: "first-reading", label: "First Reading", icon: "✨", unlocked: total >= 1 },
        { id: "tarot-novice", label: "Tarot Novice", icon: "🃏", unlocked: (counts.tarot_readings ?? 0) >= 3 },
        { id: "tarot-adept", label: "Tarot Adept", icon: "🔮", unlocked: (counts.tarot_readings ?? 0) >= 10 },
        { id: "dreamer", label: "Dreamer", icon: "🌙", unlocked: (counts.dream_interpretations ?? 0) >= 3 },
        { id: "dream-master", label: "Dream Master", icon: "💤", unlocked: (counts.dream_interpretations ?? 0) >= 10 },
        { id: "rune-caster", label: "Rune Caster", icon: "ᚠ", unlocked: (counts.rune_readings ?? 0) >= 3 },
        { id: "star-reader", label: "Star Reader", icon: "⭐", unlocked: (counts.daily_horoscopes ?? 0) >= 5 },
        { id: "chart-seeker", label: "Chart Seeker", icon: "🪐", unlocked: (counts.birth_charts ?? 0) >= 1 },
        { id: "streak-3", label: "3-Day Streak", icon: "🔥", unlocked: streak >= 3 },
        { id: "streak-7", label: "7-Day Streak", icon: "🌟", unlocked: streak >= 7 },
        { id: "streak-30", label: "30-Day Streak", icon: "🏆", unlocked: streak >= 30 },
        { id: "explorer", label: "Mystic Explorer", icon: "🧭", unlocked: Object.values(counts).filter((c) => c > 0).length >= 3 },
        { id: "devotee", label: "Devotee", icon: "🕯️", unlocked: total >= 25 },
        { id: "oracle", label: "Oracle", icon: "👁️", unlocked: total >= 50 },
        { id: "grand-mystic", label: "Grand Mystic", icon: "👑", unlocked: total >= 100 },
      ];

      return { streak, total, counts, achievements };
    },
  });

  const achievements = query.data?.achievements ?? [];
  const unlocked = achievements.filter((a) => a.unlocked);
  const rank =
    unlocked.length >= 12 ? "Grand Mystic"
    : unlocked.length >= 8 ? "Oracle"
    : unlocked.length >= 4 ? "Mystic Explorer"
    : unlocked.length >= 1 ? "Seeker"
    : "Newcomer";

  return {
    streak: query.data?.streak ?? 0,
    total: query.data?.total ?? 0,
    achievements,
    unlockedCount: unlocked.length,
    totalAchievements: achievements.length || 15,
    rank,
    isLoading: query.isLoading,
  };
};
