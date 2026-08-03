import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LotteryStats {
  total: number;
  saved: number;
  currentStreak: number;
  bestStreak: number;
  weekActivity: boolean[]; // Mo..Su for the current week
  lotteryTypes: number;
  statsViews: number;
  topNumbers: { num: number; count: number; pct: number }[];
  oddEven: { odd: number; even: number };
  highLow: { high: number; low: number };
  consecutivePct: number;
  hotNumbers: number[];
  coldNumbers: number[];
}

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

function computeStreaks(dates: string[]) {
  const unique = Array.from(new Set(dates)).sort();
  if (unique.length === 0) return { currentStreak: 0, bestStreak: 0 };

  let best = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1] + "T00:00:00Z").getTime();
    const cur = new Date(unique[i] + "T00:00:00Z").getTime();
    const diff = Math.round((cur - prev) / 86400000);
    run = diff === 1 ? run + 1 : 1;
    if (run > best) best = run;
  }

  const today = new Date();
  const todayKey = dayKey(today);
  const yesterday = new Date(today.getTime() - 86400000);
  const yKey = dayKey(yesterday);
  const last = unique[unique.length - 1];

  let current = 0;
  if (last === todayKey || last === yKey) {
    current = 1;
    for (let i = unique.length - 1; i > 0; i--) {
      const prev = new Date(unique[i - 1] + "T00:00:00Z").getTime();
      const cur = new Date(unique[i] + "T00:00:00Z").getTime();
      if (Math.round((cur - prev) / 86400000) === 1) current++;
      else break;
    }
  }
  return { currentStreak: current, bestStreak: Math.max(best, current) };
}

export function useLotteryStats() {
  return useQuery<LotteryStats>({
    queryKey: ["lottery-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const empty: LotteryStats = { total: 0, saved: 0, currentStreak: 0, bestStreak: 0,
        weekActivity: [false, false, false, false, false, false, false],
        lotteryTypes: 0, statsViews: 0, topNumbers: [], oddEven: { odd: 0, even: 0 },
        highLow: { high: 0, low: 0 }, consecutivePct: 0, hotNumbers: [], coldNumbers: [] };
      if (!user) return empty;

      const { data, error } = await supabase
        .from("lottery_generations")
        .select("lottery_type, main_numbers, is_favorite, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;

      const rows = data ?? [];
      if (rows.length === 0) return empty;

      const days = rows.map((r: any) => dayKey(new Date(r.created_at)));
      const { currentStreak, bestStreak } = computeStreaks(days);

      // Current week (Mon..Sun)
      const now = new Date();
      const dow = now.getDay() === 0 ? 6 : now.getDay() - 1;
      const monday = new Date(now.getTime() - dow * 86400000);
      const weekActivity = Array.from({ length: 7 }, (_, i) =>
        days.includes(dayKey(new Date(monday.getTime() + i * 86400000))),
      );

      const freq: Record<number, number> = {};
      let odd = 0, even = 0, high = 0, low = 0, consecutiveSets = 0;
      let maxSeen = 0;
      rows.forEach((r: any) => {
        const nums: number[] = (r.main_numbers ?? []).map(Number).filter((n: number) => Number.isFinite(n));
        nums.forEach((n) => { freq[n] = (freq[n] ?? 0) + 1; if (n > maxSeen) maxSeen = n; });
        const sorted = [...nums].sort((a, b) => a - b);
        if (sorted.some((n, i) => i > 0 && n === sorted[i - 1] + 1)) consecutiveSets++;
      });
      const mid = Math.max(Math.ceil(maxSeen / 2), 1);
      rows.forEach((r: any) => {
        (r.main_numbers ?? []).map(Number).forEach((n: number) => {
          if (n % 2 === 0) even++; else odd++;
          if (n > mid) high++; else low++;
        });
      });

      const entries = Object.entries(freq).map(([n, c]) => ({ num: Number(n), count: c }));
      const maxCount = Math.max(...entries.map((e) => e.count), 1);
      const sortedDesc = [...entries].sort((a, b) => b.count - a.count);

      return { total: rows.length,
        saved: rows.filter((r: any) => r.is_favorite).length,
        currentStreak,
        bestStreak,
        weekActivity,
        lotteryTypes: new Set(rows.map((r: any) => r.lottery_type)).size,
        statsViews: 0,
        topNumbers: sortedDesc.slice(0, 5).map((e) => ({ ...e, pct: Math.round((e.count / maxCount) * 100) })),
        oddEven: { odd, even },
        highLow: { high, low },
        consecutivePct: Math.round((consecutiveSets / rows.length) * 100),
        hotNumbers: sortedDesc.slice(0, 6).map((e) => e.num),
        coldNumbers: [...sortedDesc].reverse().slice(0, 6).map((e) => e.num) };
    },
    staleTime: 30_000 });
}
