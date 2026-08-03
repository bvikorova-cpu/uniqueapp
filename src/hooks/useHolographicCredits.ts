import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/** Credit costs for every paid Holographic Avatars action. */
export const HOLO_COSTS = {
  avatar_create: 10,
  pack_basic: 5,
  pack_advanced: 15,
  battle_1v1: 2,
  battle_tournament: 5,
  battle_survival: 3,
  breeding: 10,
} as const;

/**
 * Unified credits hook for the Holographic Avatars module.
 * Reads the live `ai_credits` balance and spends via the atomic RPC
 * (`deduct_ai_credits_atomic`), which also writes the credits ledger row.
 */
export function useHolographicCredits() {
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

  /** Deduct `amount` credits. Returns true on success, false (with toast) otherwise. */
  const spend = useCallback(
    async (amount: number, reason: string): Promise<boolean> => {
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
        console.error("Holographic credit deduction failed", error);
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
        description: `holographic:${reason}`,
      });
      return true;
    },
    [balance, refresh]
  );

  return { balance, loading, spend, refresh };
}
