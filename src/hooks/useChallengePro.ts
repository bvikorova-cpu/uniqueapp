import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Challenge PRO subscription (€3/month) — grants 2× monthly prize
 * (200,000 XP instead of 100,000 XP) and a gold-leaf badge next to
 * the user's name on Eco and Healthy Challenge feeds & leaderboards.
 */
export function useChallengePro() {
  const { user } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [activeUntil, setActiveUntil] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setIsPro(false); setActiveUntil(null); setLoading(false); return; }
    setLoading(true);
    // Fast path: read local table (kept in sync by edge function).
    const { data } = await supabase
      .from("challenge_pro_subscribers" as any)
      .select("active_until")
      .eq("user_id", user.id)
      .maybeSingle();
    const until = (data as any)?.active_until as string | null | undefined;
    const active = !!until && new Date(until).getTime() > Date.now();
    setIsPro(active);
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

  const subscribe = useCallback(async () => {
    setCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { product: "challenge_pro" },
      });
      if (error) throw error;
      const url = (data as any)?.url;
      if (url) window.location.href = url;
    } finally {
      setCheckingOut(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Auto-sync after Stripe redirect
  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("challenge_pro") === "1" && params.get("payment") === "success") {
      syncFromStripe();
    }
  }, [user?.id, syncFromStripe]);

  return { isPro, activeUntil, loading, subscribe, checkingOut, refresh, syncFromStripe };
}

/**
 * Fetch the set of user IDs (from a given list) that currently have active PRO,
 * so we can render the gold badge next to their names in feeds & leaderboards.
 */
export function useChallengeProSet(userIds: string[]) {
  const [proSet, setProSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    const ids = Array.from(new Set(userIds.filter(Boolean)));
    if (ids.length === 0) { setProSet(new Set()); return; }
    (async () => {
      const { data } = await supabase
        .from("challenge_pro_subscribers" as any)
        .select("user_id, active_until")
        .in("user_id", ids);
      if (cancelled) return;
      const now = Date.now();
      const next = new Set(
        (data || [])
          .filter((r: any) => r.active_until && new Date(r.active_until).getTime() > now)
          .map((r: any) => r.user_id as string),
      );
      setProSet(next);
    })();
    return () => { cancelled = true; };
  }, [userIds.join(",")]);

  return proSet;
}
