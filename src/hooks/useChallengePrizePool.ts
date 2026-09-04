import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ChallengePrizePool {
  /** Total active monthly subscription revenue in cents (PRO €3 + TOP €5). */
  revenueCents: number;
  /** 50% — paid to the monthly champion. */
  winnerCents: number;
  /** 20% — paid to the charity the champion selected. */
  charityCents: number;
  /** 30% — platform share. */
  platformCents: number;
  subscribers: number;
  proCount: number;
  topCount: number;
}

const euro = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(cents / 100);

export const formatEuroCents = euro;

/**
 * Live monthly prize pool for the Eco / Healthy Challenge.
 * Values come straight from the DB (active PRO/TOP subscriptions), refresh every
 * 15s and update instantly through realtime on `challenge_pro_subscribers`.
 */
export const useChallengePrizePool = () => {
  const queryClient = useQueryClient();

  const query = useQuery<ChallengePrizePool>({
    queryKey: ["challenge-prize-pool"],
    staleTime: 0,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const nowIso = new Date().toISOString();
      const [revenueRes, subsRes] = await Promise.all([
        supabase.rpc("challenge_monthly_revenue_cents"),
        supabase
          .from("challenge_pro_subscribers")
          .select("tier")
          .gt("active_until", nowIso),
      ]);

      const revenueCents = Number(revenueRes.data ?? 0);
      const rows = (subsRes.data ?? []) as Array<{ tier: string | null }>;

      // Same floor math as the SQL award functions (50 / 20 / rest).
      const winnerCents = Math.floor(revenueCents * 0.5);
      const charityCents = Math.floor(revenueCents * 0.2);

      return {
        revenueCents,
        winnerCents,
        charityCents,
        platformCents: revenueCents - winnerCents - charityCents,
        subscribers: rows.length,
        proCount: rows.filter((r) => r.tier === "pro").length,
        topCount: rows.filter((r) => r.tier === "top").length,
      };
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("challenge-prize-pool-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "challenge_pro_subscribers" },
        () => queryClient.invalidateQueries({ queryKey: ["challenge-prize-pool"] }),
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return query;
};
