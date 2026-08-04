import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/** Credit costs for every paid Time Reversal action (unified ai_credits pool). */
export const TIME_REVERSAL_COSTS = {
  speed_boost: 5,
  age_lock: 3,
  future_glimpse: 5,
  paradox_post: 2,
  life_story: 5,
  timelapse: 5,
} as const;

export type TimeReversalAction = keyof typeof TIME_REVERSAL_COSTS;

/**
 * Unified credits hook for the Time Reversal module.
 * Reads the live `ai_credits` balance and spends via the atomic RPC
 * (`deduct_ai_credits_atomic`), which also writes the credits ledger row.
 */
export function useTimeReversalCredits() {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setBalance(0); return; }
      const { data } = await supabase
        .from("ai_credits")
        .select("credits_remaining")
        .eq("user_id", user.id)
        .maybeSingle();
      setBalance(data?.credits_remaining ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  /** Deduct credits for an action. Returns true on success, false (with toast) otherwise. */
  const spend = useCallback(
    async (action: TimeReversalAction, description?: string): Promise<boolean> => {
      const amount = TIME_REVERSAL_COSTS[action];
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Sign in required", { description: "Please log in to continue." });
        return false;
      }
      if (balance < amount) {
        toast.error("Not enough credits", {
          description: `This action costs ${amount} credits — you have ${balance}.`,
          action: { label: "Top up", onClick: () => { window.location.href = "/ai-credits"; } },
        });
        return false;
      }
      const { data, error } = await supabase.rpc("deduct_ai_credits_atomic", {
        _user_id: user.id,
        _amount: amount,
      });
      if (error) {
        console.error("Time Reversal credit deduction failed", error);
        toast.error("Not enough credits", {
          description: `This action costs ${amount} credits. Top up to continue.`,
          action: { label: "Top up", onClick: () => { window.location.href = "/ai-credits"; } },
        });
        return false;
      }
      if (typeof data === "number") setBalance(data);
      else await refresh();
      await supabase.from("ai_usage_history").insert({
        user_id: user.id,
        usage_type: "custom_generation",
        credits_used: amount,
        description: description || `time-reversal:${action}`,
      });
      window.dispatchEvent(new Event("ai-credits-updated"));
      return true;
    },
    [balance, refresh]
  );

  return { balance, loading, spend, refresh, costs: TIME_REVERSAL_COSTS };
}
