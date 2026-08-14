import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type CreditAction = "megatalent_vote" | "megatalent_comment" | "megatalent_upload" | "wellness_ai_tool" | "concert_chat_message" | "comedy_chat_message";

export const CREDIT_COSTS: Record<CreditAction, number> = { megatalent_vote: 1,
  megatalent_comment: 1,
  megatalent_upload: 3,
  wellness_ai_tool: 3,
  concert_chat_message: 1,
  comedy_chat_message: 1 };


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

      // 2) Atomic AI credit spend: deduct + ledger + usage history in one RPC.
      // Client-side ledger inserts are blocked by RLS, so the RPC is the only
      // path that keeps balance and ledger consistent (Core rule).
      try {
        const { data, error } = await (supabase as any).rpc("spend_ai_credits", {
          _amount: amount,
          _reason: opts?.description || action,
          _source: action });
        if (error) throw error;
        if ((data as any)?.ok) return true;
      } catch (e) {
        console.error("AI credits deduction failed", e);
      }


      // 3) Insufficient — toast + redirect
      toast.error("Not enough credits", {
        description: `This action costs ${amount} credit${amount > 1 ? "s" : ""}. Top up to continue.`,
        action: { label: "Top up",
          onClick: () => navigate("/ai-credits") },
        duration: 6000 });
      setTimeout(() => navigate("/ai-credits"), 1200);
      return false;
    },
    [user, navigate]
  );

  return { spend, costs: CREDIT_COSTS };
}
