import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ChallengePoolKind = "eco" | "healthy";

export interface ChallengePrizePool {
  /** Monthly subscription revenue of THIS challenge in cents (PRO €3 + TOP €5). */
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

/** Monthly price per tier, in cents — must match Stripe. */
const TIER_CENTS: Record<string, number> = { pro: 300, top: 500 };

/**
 * Live monthly prize pool for one challenge (eco or healthy).
 * Each challenge has its OWN pool: only active subscriptions of that challenge
 * are counted (Megatalent has a separate pool of its own).
 * Refreshes every 15s and instantly through realtime.
 */
export const useChallengePrizePool = (challenge: ChallengePoolKind) => {
  const queryClient = useQueryClient();

  const query = useQuery<ChallengePrizePool>({
    queryKey: ["challenge-prize-pool", challenge],
    staleTime: 0,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const nowIso = new Date().toISOString();
      const { data } = await supabase
        .from("challenge_pro_subscribers")
        .select("tier")
        .eq("challenge", challenge)
        .gt("active_until", nowIso);

      const rows = (data ?? []) as Array<{ tier: string | null }>;
      const revenueCents = rows.reduce(
        (sum, r) => sum + (TIER_CENTS[r.tier === "top" ? "top" : "pro"] ?? 0),
        0,
      );

      // Same floor math as the SQL award functions (50 / 20 / rest).
      const winnerCents = Math.floor(revenueCents * 0.5);
      const charityCents = Math.floor(revenueCents * 0.2);

      return {
        revenueCents,
        winnerCents,
        charityCents,
        platformCents: revenueCents - winnerCents - charityCents,
        subscribers: rows.length,
        proCount: rows.filter((r) => r.tier !== "top").length,
        topCount: rows.filter((r) => r.tier === "top").length,
      };
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel(`challenge-prize-pool-live-${challenge}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "challenge_pro_subscribers" },
        () => queryClient.invalidateQueries({ queryKey: ["challenge-prize-pool", challenge] }),
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient, challenge]);

  return query;
};
