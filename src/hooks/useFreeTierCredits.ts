import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface FreeTierCredits {
  user_id: string;
  balance: number;
  month_key: string;
  welcome_shown: boolean;
  granted_at: string;
  updated_at: string;
}

/**
 * Free tier credits hook.
 * - 10 credits granted at signup (via handle_new_user_free_credits trigger)
 * - +10 credits on the 1st of each month (via ensure_free_tier_credits RPC, Europe/Bratislava TZ)
 */
export function useFreeTierCredits() {
  const { user } = useAuth();
  const [data, setData] = useState<FreeTierCredits | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // SCALE: ensure_free_tier_credits RPC was top DB hotspot (9.7k calls,
      // 633s total). The monthly top-up only changes once per UTC month, so
      // we gate the RPC behind a per-session cache and fall back to a cheap
      // read of the row on subsequent mounts in the same session.
      const cacheKey = `ftc_ensured:${user.id}:${new Date().toISOString().slice(0, 7)}`;
      const alreadyEnsured = (() => {
        try { return sessionStorage.getItem(cacheKey) === "1"; } catch { return false; }
      })();

      if (!alreadyEnsured) {
        const { data: ensured } = await (supabase as any).rpc("ensure_free_tier_credits");
        try { sessionStorage.setItem(cacheKey, "1"); } catch { /* noop */ }
        if (ensured) {
          setData(ensured as FreeTierCredits);
          return;
        }
      }

      const { data: row } = await (supabase as any)
        .from("free_tier_credits")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      setData((row as FreeTierCredits) ?? null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markWelcomeShown = useCallback(async () => {
    if (!user) return;
    await (supabase as any)
      .from("free_tier_credits")
      .update({ welcome_shown: true })
      .eq("user_id", user.id);
    setData((d) => (d ? { ...d, welcome_shown: true } : d));
  }, [user?.id]);

  const consume = useCallback(
    async (amount: number, reason: string): Promise<boolean> => {
      if (!user) return false;
      const { data: ok, error } = await (supabase as any).rpc(
        "consume_free_tier_credits",
        { _amount: amount, _reason: reason }
      );
      if (error || !ok) return false;
      await refresh();
      return true;
    },
    [user?.id, refresh]
  );

  return { data, loading, refresh, markWelcomeShown, consume };
}
