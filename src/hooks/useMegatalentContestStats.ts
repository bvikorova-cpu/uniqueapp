import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { categoryGroups } from "@/components/megatalent/megatalentConstants";

// 80/20 split: 80% of subscription revenue funds the monthly prize pool.
const PRIZE_POOL_SPLIT = 0.8;
const TIER_PRICE: Record<string, number> = { premium: 10, top_premium: 15 };

export interface ContestStats {
  prizePool: number;
  prizePoolFormatted: string;
  categoryCount: number;
  activeTalents: number;
  lastWinnerPrize: number | null;
}

const totalCategories = categoryGroups.reduce(
  (sum, g) => sum + g.categories.length,
  0,
);

export const useMegatalentContestStats = () => {
  return useQuery<ContestStats>({
    queryKey: ["megatalent-contest-stats"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      // Active subscriptions → estimated prize pool for current cycle.
      const { data: subs } = await supabase
        .from("megatalent_subscriptions")
        .select("tier")
        .eq("status", "active");

      const revenue = (subs || []).reduce(
        (sum, s: any) => sum + (TIER_PRICE[s.tier] ?? 0),
        0,
      );
      const prizePool = Math.floor(revenue * PRIZE_POOL_SPLIT);

      // Distinct talents with at least one active submission.
      const { data: talents } = await supabase
        .from("talent_submissions")
        .select("user_id")
        .eq("is_active", true);
      const activeTalents = new Set((talents || []).map((t: any) => t.user_id))
        .size;

      // Most recent paid-out prize (for "Hall of Fame" fallback display).
      const { data: lastWinner } = await (supabase as any)
        .from("megatalent_winners")
        .select("prize_amount")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const fmt = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      });

      return {
        prizePool,
        prizePoolFormatted: fmt.format(prizePool),
        categoryCount: totalCategories,
        activeTalents,
        lastWinnerPrize: lastWinner?.prize_amount ?? null,
      };
    },
  });
};

export const MEGATALENT_CATEGORY_COUNT = totalCategories;
