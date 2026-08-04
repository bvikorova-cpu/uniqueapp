import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Credit costs for Time Capsule (unified `ai_credits` pool).
 * Priced to match the previous EUR plans at ~€0.40 / credit:
 *  1 year  ≈ €4.99  → 12 credits
 *  5 years ≈ €9.99  → 25 credits
 * 10 years ≈ €19.99 → 50 credits
 * 20 years ≈ €49.99 → 125 credits
 */
export const TIME_CAPSULE_COSTS = {
  capsule_1y: 12,
  capsule_5y: 25,
  capsule_10y: 50,
  capsule_20y: 125,
} as const;

export type TimeCapsuleAction = keyof typeof TIME_CAPSULE_COSTS;

/** Maps a capsule duration (in years) to the matching credit tier. */
export function costForDuration(years: number): { action: TimeCapsuleAction; credits: number } {
  if (years >= 20) return { action: "capsule_20y", credits: TIME_CAPSULE_COSTS.capsule_20y };
  if (years >= 10) return { action: "capsule_10y", credits: TIME_CAPSULE_COSTS.capsule_10y };
  if (years >= 5) return { action: "capsule_5y", credits: TIME_CAPSULE_COSTS.capsule_5y };
  return { action: "capsule_1y", credits: TIME_CAPSULE_COSTS.capsule_1y };
}

export function useTimeCapsuleCredits() {
  const [balance, setBalance] = useState(0);
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

  /** Deduct credits for a capsule. Returns true on success. */
  const spend = useCallback(async (action: TimeCapsuleAction, description?: string): Promise<boolean> => {
    const amount = TIME_CAPSULE_COSTS[action];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Sign in required", { description: "Please log in to continue." });
      return false;
    }
    if (balance < amount) {
      toast.error("Not enough credits", {
        description: `This capsule costs ${amount} credits — you have ${balance}.`,
        action: { label: "Top up", onClick: () => { window.location.href = "/ai-credits"; } },
      });
      return false;
    }
    const { data, error } = await supabase.rpc("deduct_ai_credits_atomic", {
      _user_id: user.id,
      _amount: amount,
    });
    if (error) {
      console.error("Time Capsule credit deduction failed", error);
      toast.error("Not enough credits", {
        description: `This capsule costs ${amount} credits. Top up to continue.`,
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
      description: description || `time-capsule:${action}`,
    });
    window.dispatchEvent(new Event("ai-credits-updated"));
    return true;
  }, [balance, refresh]);

  /** Refund credits when capsule creation fails after the deduction. */
  const refund = useCallback(async (action: TimeCapsuleAction, description?: string): Promise<boolean> => {
    const amount = TIME_CAPSULE_COSTS[action];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { error } = await supabase.rpc("add_ai_credits", {
      p_user_id: user.id,
      p_amount: amount,
      p_reason: description || `refund:time-capsule:${action}`,
      p_source: "auto_refund",
    });
    if (error) { console.error("Time Capsule credit refund failed", error); return false; }
    await refresh();
    window.dispatchEvent(new Event("ai-credits-updated"));
    toast.success("Credits refunded", { description: `${amount} credits were returned to your balance.` });
    return true;
  }, [refresh]);

  return { balance, loading, spend, refund, refresh, costs: TIME_CAPSULE_COSTS };
}
