import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/** Credit prices for the Work (Jobs) section — credits only, no EUR. */
export const JOBS_CREDIT_COSTS = {
  listing_7: 10,
  listing_14: 20,
  listing_30: 30,
  boost_basic: 15,
  boost_premium: 30,
  boost_ultimate: 60,
} as const;

export type JobsCreditAction = keyof typeof JOBS_CREDIT_COSTS;

/**
 * Isolated credit spender for the Work section.
 * Uses the unified `spend_ai_credits` RPC (atomic deduct + ledger row).
 */
export function useJobsCredits() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const spend = useCallback(
    async (amount: number, reason: string): Promise<boolean> => {
      if (!user) {
        toast.error("Sign in required", { description: "Please log in to continue." });
        return false;
      }
      try {
        const { data, error } = await (supabase as any).rpc("spend_ai_credits", {
          _amount: amount,
          _reason: reason,
          _source: "jobs",
        });
        if (error) throw error;
        if ((data as any)?.ok) {
          window.dispatchEvent(new Event("ai-credits-updated"));
          return true;
        }
      } catch (e) {
        console.error("Jobs credit spend failed", e);
      }

      toast.error("Not enough credits", {
        description: `This costs ${amount} credit${amount > 1 ? "s" : ""}. Top up to continue.`,
        action: { label: "Top up", onClick: () => navigate("/ai-credits") },
        duration: 6000,
      });
      return false;
    },
    [user, navigate]
  );

  return { spend, costs: JOBS_CREDIT_COSTS };
}
