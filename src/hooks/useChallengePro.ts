import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type ChallengeTier = "pro" | "top" | null;

/**
 * Challenge PRO (€3/mo) & TOP (€5/mo) subscription state.
 * - PRO: 2× monthly prize (200,000 XP) + gold badge.
 * - TOP: everything in PRO + 500,000 XP monthly + 1,000,000 ai_credits monthly
 *        (non-cashable) + TOP badge + submissions auto-pinned to top of feed.
 */
export type ChallengeKind = "eco" | "healthy";

export function useChallengePro(challenge: ChallengeKind = "eco") {
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
      .eq("challenge", challenge)
      .maybeSingle();
    const until = (data as any)?.active_until as string | null | undefined;
    const rawTier = ((data as any)?.tier as string | null | undefined) ?? "pro";
    const active = !!until && new Date(until).getTime() > Date.now();
    setTier(active ? ((rawTier === "top" ? "top" : "pro") as ChallengeTier) : null);
    setActiveUntil(until ?? null);
    setLoading(false);
  }, [user?.id, challenge]);

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
    if (!user) {
      toast.error("Please sign in first to subscribe.");
      return;
    }
    setCheckingOut(true);
    // Open the tab synchronously so mobile/iframe popup blockers don't kill it.
    const tab = window.open("", "_blank");
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { product: `${target === "top" ? "challenge_top" : "challenge_pro"}_${challenge}` } });
      if (error) throw error;
      const url = (data as any)?.url;
      if (!url) throw new Error("Checkout URL was not returned.");
      if (tab) {
        tab.location.href = url;
      } else {
        // Popup blocked — break out of the preview iframe.
        (window.top ?? window).location.href = url;
      }
    } catch (e: any) {
      tab?.close();
      console.error("challenge checkout failed", e);
      toast.error(e?.message || "Could not open Stripe checkout. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  }, [user?.id, challenge]);


  useEffect(() => { refresh(); }, [refresh]);

  // If the DB has no active row, verify once against Stripe (covers payments
  // that completed but were never synced back).
  useEffect(() => {
    if (!user || loading || tier) return;
    let cancelled = false;
    (async () => {
      try {
        await supabase.functions.invoke("sync-challenge-pro");
        if (!cancelled) await refresh();
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [user?.id, challenge, loading, tier]);


  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("challenge_pro") === "1" && params.get("payment") === "success") {
      syncFromStripe();
    }
  }, [user?.id, syncFromStripe]);

  return { tier,
    isPro: tier === "pro" || tier === "top",
    isTop: tier === "top",
    activeUntil,
    loading,
    subscribe,
    checkingOut,
    refresh,
    syncFromStripe };
}

/**
 * Fetch tier map for a list of user IDs, so feeds & leaderboards can render
 * the correct PRO / TOP badge next to each name.
 */
export function useChallengeProSet(userIds: string[], challenge: ChallengeKind = "eco") {
  const [tierMap, setTierMap] = useState<Map<string, "pro" | "top">>(new Map());

  useEffect(() => {
    let cancelled = false;
    const ids = Array.from(new Set(userIds.filter(Boolean)));
    if (ids.length === 0) { setTierMap(new Map()); return; }
    (async () => {
      const { data } = await supabase
        .from("challenge_pro_subscribers")
        .select("user_id, active_until, tier")
        .eq("challenge", challenge)
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
  }, [userIds.join(","), challenge]);

  // Back-compat: existing callers use `.has(id)` — return a Set-like proxy
  const proSet = { has: (id: string) => tierMap.has(id),
    get: (id: string) => tierMap.get(id),
    tierOf: (id: string): "pro" | "top" | null => tierMap.get(id) ?? null,
    size: tierMap.size,
    map: tierMap };
  return proSet as unknown as Set<string> & {
    tierOf: (id: string) => "pro" | "top" | null;
    map: Map<string, "pro" | "top">;
  };
}
