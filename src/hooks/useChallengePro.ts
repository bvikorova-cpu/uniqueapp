import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type ChallengeTier = "pro" | "top" | null;

/**
 * Challenge PRO (€3/mo) & TOP (€5/mo) subscription state.
 * - PRO: 2× monthly prize (200,000 XP) + gold badge.
 * - TOP: everything in PRO + 500,000 XP monthly + 1,000,000 ai_credits monthly
 *        (non-cashable) + TOP badge + submissions auto-pinned to top of feed.
 */
export function useChallengePro() {
  const { user } = useAuth();
  const [tier, setTier] = useState<ChallengeTier>(null);
  const [activeUntil, setActiveUntil] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setTier(null); setActiveUntil(null); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("challenge_pro_subscribers")
      .select("active_until, tier")
      .eq("user_id", user.id)
      .maybeSingle();
    const until = (data as any)?.active_until as string | null | undefined;
    const rawTier = ((data as any)?.tier as string | null | undefined) ?? "pro";
    const active = !!until && new Date(until).getTime() > Date.now();
    setTier(active ? ((rawTier === "top" ? "top" : "pro") as ChallengeTier) : null);
    setActiveUntil(until ?? null);
    setLoading(false);
  }, [user?.id]);

  /** Force a Stripe → DB re-sync (call after checkout success). */
  const syncFromStripe = useCallback(async () => {
    if (!user) return;
    try {
      await supabase.functions.invoke("sync-challenge-pro");
    } catch (e) {
      console.warn("sync-challenge-pro failed", e);
    }
    await refresh();
  }, [user?.id, refresh]);

  const subscribe = useCallback(async (target: "pro" | "top" = "pro") => {
    setCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { product: target === "top" ? "challenge_top" : "challenge_pro" },
      });
      if (error) throw error;
      const url = (data as any)?.url;
      if (url) window.location.href = url;
    } finally {
      setCheckingOut(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("challenge_pro") === "1" && params.get("payment") === "success") {
      syncFromStripe();
    }
  }, [user?.id, syncFromStripe]);

  return {
    tier,
    isPro: tier === "pro" || tier === "top",
    isTop: tier === "top",
    activeUntil,
    loading,
    subscribe,
    checkingOut,
    refresh,
    syncFromStripe,
  };
}

/**
 * Fetch tier map for a list of user IDs, so feeds & leaderboards can render
 * the correct PRO / TOP badge next to each name.
 */
export function useChallengeProSet(userIds: string[]) {
  const [tierMap, setTierMap] = useState<Map<string, "pro" | "top">>(new Map());

  useEffect(() => {
    let cancelled = false;
    const ids = Array.from(new Set(userIds.filter(Boolean)));
    if (ids.length === 0) { setTierMap(new Map()); return; }
    (async () => {
      const { data } = await supabase
        .from("challenge_pro_subscribers")
        .select("user_id, active_until, tier")
        .in("user_id", ids);
      if (cancelled) return;
      const now = Date.now();
      const next = new Map<string, "pro" | "top">();
      for (const r of (data || []) as any[]) {
        if (r.active_until && new Date(r.active_until).getTime() > now) {
          next.set(r.user_id, r.tier === "top" ? "top" : "pro");
        }
      }
      setTierMap(next);
    })();
    return () => { cancelled = true; };
  }, [userIds.join(",")]);

  // Back-compat: existing callers use `.has(id)` — return a Set-like proxy
  const proSet = {
    has: (id: string) => tierMap.has(id),
    get: (id: string) => tierMap.get(id),
    tierOf: (id: string): "pro" | "top" | null => tierMap.get(id) ?? null,
    size: tierMap.size,
    map: tierMap,
  };
  return proSet as unknown as Set<string> & {
    tierOf: (id: string) => "pro" | "top" | null;
    map: Map<string, "pro" | "top">;
  };
}
