import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface QuantumAccess {
  loading: boolean;
  userId: string | null;
  hasProfile: boolean;
  isPremium: boolean;
  observerModeActive: boolean;
  hasQuantumProfilesSub: boolean;
  hasObserverSub: boolean;
  hasEntanglementSub: boolean;
  refresh: () => Promise<void>;
}

const isActive = (row: { status: string; expires_at: string | null }) => {
  if (row.status !== "active") return false;
  if (!row.expires_at) return true;
  return new Date(row.expires_at).getTime() > Date.now();
};

export function useQuantumAccess(): QuantumAccess {
  const [state, setState] = useState<Omit<QuantumAccess, "refresh">>({
    loading: true,
    userId: null,
    hasProfile: false,
    isPremium: false,
    observerModeActive: false,
    hasQuantumProfilesSub: false,
    hasObserverSub: false,
    hasEntanglementSub: false,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setState({
        loading: false, userId: null, hasProfile: false, isPremium: false,
        observerModeActive: false, hasQuantumProfilesSub: false,
        hasObserverSub: false, hasEntanglementSub: false,
      });
      return;
    }

    const [{ data: profile }, { data: subs }] = await Promise.all([
      supabase.from("quantum_profiles")
        .select("is_premium, observer_mode_active")
        .eq("user_id", user.id).maybeSingle(),
      supabase.from("quantum_subscriptions")
        .select("subscription_type, status, expires_at")
        .eq("user_id", user.id),
    ]);

    const activeSubs = (subs || []).filter(isActive);
    setState({
      loading: false,
      userId: user.id,
      hasProfile: !!profile,
      isPremium: !!profile?.is_premium,
      observerModeActive: !!profile?.observer_mode_active
        || activeSubs.some((s) => s.subscription_type === "observer_mode"),
      hasQuantumProfilesSub: activeSubs.some((s) => s.subscription_type === "quantum_profiles"),
      hasObserverSub: activeSubs.some((s) => s.subscription_type === "observer_mode"),
      hasEntanglementSub: activeSubs.some((s) => s.subscription_type === "quantum_entanglement"),
    });
  }, []);

  useEffect(() => {
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub.subscription.unsubscribe();
  }, [load]);

  return { ...state, refresh: load };
}
