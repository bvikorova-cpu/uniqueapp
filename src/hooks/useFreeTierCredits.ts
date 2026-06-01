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
      // Ensure monthly top-up applied (RPC is idempotent per month)
      const { data: ensured } = await (supabase as any).rpc("ensure_free_tier_credits");
      if (ensured) {
        setData(ensured as FreeTierCredits);
      } else {
        const { data: row } = await (supabase as any)
          .from("free_tier_credits")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        setData((row as FreeTierCredits) ?? null);
      }
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
