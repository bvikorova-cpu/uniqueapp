import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { categoryGroups } from "@/components/megatalent/megatalentConstants";

export interface ContestStats {
  prizePool: number;
  prizePoolFormatted: string;
  categoryCount: number;
  activeTalents: number;
  lastWinnerPrize: number | null;
  periodStart: string | null;
  periodEnd: string | null;
  periodTitle: string | null;
}

const totalCategories = categoryGroups.reduce(
  (sum, g) => sum + g.categories.length,
  0,
);

const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export const useMegatalentContestStats = () => {
  return useQuery<ContestStats>({
    queryKey: ["megatalent-contest-stats"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);

      // Active quarterly contest period (or next upcoming one).
      const { data: activePeriod } = await (supabase as any)
        .from("mt_contest_settings")
        .select("period_start, period_end, prize_pool_eur, title")
        .lte("period_start", today)
        .gte("period_end", today)
        .order("period_start", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: nextPeriod } = activePeriod
        ? { data: null }
        : await (supabase as any)
            .from("mt_contest_settings")
            .select("period_start, period_end, prize_pool_eur, title")
            .gte("period_end", today)
            .order("period_start", { ascending: true })
            .limit(1)
            .maybeSingle();

      const period = activePeriod || nextPeriod;
      const prizePool = Number(period?.prize_pool_eur ?? 10000);

      // Distinct talents with at least one active submission.
      const { data: talents } = await supabase
        .from("talent_submissions")
        .select("user_id")
        .eq("is_active", true);
      const activeTalents = new Set((talents || []).map((t: any) => t.user_id))
        .size;

      // Most recent paid-out prize.
      const { data: lastWinner } = await (supabase as any)
        .from("megatalent_winners")
        .select("prize_amount")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        prizePool,
        prizePoolFormatted: fmt.format(prizePool),
        categoryCount: totalCategories,
        activeTalents,
        lastWinnerPrize: lastWinner?.prize_amount ?? null,
        periodStart: period?.period_start ?? null,
        periodEnd: period?.period_end ?? null,
        periodTitle: period?.title ?? null,
      };
    },
  });
};

export const MEGATALENT_CATEGORY_COUNT = totalCategories;
