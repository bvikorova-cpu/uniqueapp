import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type CreditAction = "megatalent_vote" | "megatalent_comment" | "megatalent_upload";

export const CREDIT_COSTS: Record<CreditAction, number> = {
  megatalent_vote: 1,
  megatalent_comment: 1,
  megatalent_upload: 3,
};

/**
 * Unified credit spender. Tries free-tier credits first, then AI credits.
 * On failure: shows toast with CTA + redirects to /ai-credits. Returns false.
 * On success: returns true.
 */
export function useSpendCredits() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const spend = useCallback(
    async (action: CreditAction, opts?: { description?: string }): Promise<boolean> => {
      if (!user) {
        toast.error("Sign in required", { description: "Please log in to continue." });
        return false;
      }
      const amount = CREDIT_COSTS[action];

      // Free-tier path removed — paid-only model (Core).

      // 2) Fallback to AI credits
      try {
        const { data: row } = await supabase
          .from("ai_credits")
          .select("credits_remaining")
          .eq("user_id", user.id)
          .maybeSingle();

        const remaining = row?.credits_remaining ?? 0;
        if (remaining >= amount) {
          const { error: updErr } = await supabase
            .from("ai_credits")
            .update({
              credits_remaining: remaining - amount,
              last_used_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);
          if (updErr) throw updErr;

          await supabase.from("ai_usage_history").insert({
            user_id: user.id,
            usage_type: "custom_generation",
            credits_used: amount,
            description: opts?.description || action,
          });
          return true;
        }
      } catch (e) {
        console.error("AI credits deduction failed", e);
      }

      // 3) Insufficient — toast + redirect
      toast.error("Not enough credits", {
        description: `This action costs ${amount} credit${amount > 1 ? "s" : ""}. Top up to continue.`,
        action: {
          label: "Top up",
          onClick: () => navigate("/ai-credits"),
        },
        duration: 6000,
      });
      setTimeout(() => navigate("/ai-credits"), 1200);
      return false;
    },
    [user, navigate]
  );

  return { spend, costs: CREDIT_COSTS };
}
