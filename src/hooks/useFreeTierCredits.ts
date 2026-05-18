import { useEffect, useState, useCallback } from "react";
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

export function useFreeTierCredits() {
  const { user } = useAuth();
  const [data, setData] = useState<FreeTierCredits | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setData(null);
      return;
    }
    setLoading(true);
    try {
      // ensure_free_tier_credits seeds row & tops up monthly
      const rpc = (supabase as any).rpc;
      const fromFn = (supabase as any).from;
      if (typeof rpc !== "function" || typeof fromFn !== "function") {
        setLoading(false);
        return;
      }
      const { data: ensured, error } = await rpc.call(supabase, "ensure_free_tier_credits");
      if (!error && ensured) {
        setData(Array.isArray(ensured) ? ensured[0] : ensured);
      } else {
        const { data: row } = await (supabase as any)
          .from("free_tier_credits")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        if (row) setData(row as FreeTierCredits);
      }
    } catch (e) {
      // swallow — non-critical for app boot
    }
    setLoading(false);
  }, [user]);

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
  }, [user]);

  /**
   * Atomically deduct credits. Returns true on success, false if insufficient.
   * Throws on unexpected errors (network/RLS).
   */
  const consume = useCallback(
    async (amount: number, reason: string): Promise<boolean> => {
      if (!user) return false;
      const { data: row, error } = await (supabase as any).rpc(
        "consume_free_tier_credits",
        { p_amount: amount, p_reason: reason }
      );
      if (error) {
        if (error.message?.includes("INSUFFICIENT_CREDITS")) return false;
        throw error;
      }
      if (row) setData(Array.isArray(row) ? row[0] : row);
      return true;
    },
    [user]
  );

  return { data, loading, refresh, markWelcomeShown, consume };
}
