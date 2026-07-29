import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ForgeProgressStats {
  totalProjects: number;
  creditsUsed: number;
  categories: string[];
  styleReferences: string[];
  /** ISO date strings (yyyy-mm-dd) on which the user created content */
  activeDays: string[];
  currentStreak: number;
  bestStreak: number;
  /** Monday-first flags for the current week */
  weekActivity: boolean[];
}

const toKey = (d: Date) => d.toISOString().slice(0, 10);

const buildStreaks = (days: string[]) => {
  if (days.length === 0) return { currentStreak: 0, bestStreak: 0 };
  const set = new Set(days);
  let best = 0;
  for (const day of days) {
    const prev = new Date(`${day}T00:00:00Z`);
    prev.setUTCDate(prev.getUTCDate() - 1);
    if (set.has(toKey(prev))) continue; // not the start of a run
    let len = 0;
    const cursor = new Date(`${day}T00:00:00Z`);
    while (set.has(toKey(cursor))) {
      len += 1;
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    best = Math.max(best, len);
  }

  // Current streak: counts back from today (or yesterday if nothing today yet)
  let current = 0;
  const cursor = new Date();
  if (!set.has(toKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (set.has(toKey(cursor))) {
    current += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return { currentStreak: current, bestStreak: best };
};

export const useCreativeForgeProgress = () => {
  return useQuery<ForgeProgressStats>({
    queryKey: ["creative-forge-progress"],
    staleTime: 60_000,
    queryFn: async () => {
      const empty: ForgeProgressStats = {
        totalProjects: 0,
        creditsUsed: 0,
        categories: [],
        styleReferences: [],
        activeDays: [],
        currentStreak: 0,
        bestStreak: 0,
        weekActivity: [false, false, false, false, false, false, false],
      };

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return empty;

      const { data, error } = await supabase
        .from("creative_forge_projects")
        .select("category, style_reference, credits_used, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1000);

      if (error) throw error;
      const rows = data ?? [];
      if (rows.length === 0) return empty;

      const activeDays = Array.from(
        new Set(rows.map((r: any) => new Date(r.created_at).toISOString().slice(0, 10)))
      ).sort();

      const { currentStreak, bestStreak } = buildStreaks(activeDays);

      // Monday-first week flags
      const now = new Date();
      const dow = now.getDay() === 0 ? 6 : now.getDay() - 1;
      const monday = new Date(now);
      monday.setDate(now.getDate() - dow);
      const activeSet = new Set(activeDays);
      const weekActivity = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return activeSet.has(toKey(d));
      });

      return {
        totalProjects: rows.length,
        creditsUsed: rows.reduce((s: number, r: any) => s + (r.credits_used ?? 0), 0),
        categories: Array.from(new Set(rows.map((r: any) => r.category).filter(Boolean))),
        styleReferences: Array.from(new Set(rows.map((r: any) => r.style_reference).filter(Boolean))),
        activeDays,
        currentStreak,
        bestStreak,
        weekActivity,
      };
    },
  });
};
