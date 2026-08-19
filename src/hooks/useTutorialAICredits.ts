import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useTutoringCredits } from "@/hooks/useTutoringCredits";
import { useToast } from "@/hooks/use-toast";

/**
 * Tutorial platform AI credits.
 * Uses the unified `ai_credits` pool through the atomic `spend_ai_credits` RPC,
 * so every spend writes an `ai_credits_ledger` row (no client-side arithmetic).
 */
export const useTutorialAICredits = () => {
  const { credits, isLoading } = useTutoringCredits();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeducting, setIsDeducting] = useState(false);

  const refreshBalance = () => {
    queryClient.invalidateQueries({ queryKey: ["tutoring-credits"] });
    queryClient.invalidateQueries({ queryKey: ["ai-credits"] });
    window.dispatchEvent(new Event("ai-credits-updated"));
  };

  /** Atomically deducts `amount` credits. Returns false (with a toast) if it failed. */
  const checkAndDeduct = async (amount: number, reason = "tutorial_platform_ai"): Promise<boolean> => {
    setIsDeducting(true);
    try {
      const { data, error } = await (supabase as any).rpc("spend_ai_credits", {
        _amount: amount,
        _reason: reason,
        _source: "tutorial_platform",
      });
      if (error) throw error;
      if (!data?.ok) {
        if (data?.error === "insufficient") {
          toast({
            title: "Insufficient Credits",
            description: `This action requires ${amount} credits. You have ${data?.balance ?? 0}.`,
            variant: "destructive",
          });
        } else if (data?.error === "not_authenticated") {
          toast({ title: "Sign in required", description: "Log in to use AI tools.", variant: "destructive" });
        } else {
          toast({ title: "Credit Error", description: "Could not deduct credits. Please try again.", variant: "destructive" });
        }
        return false;
      }
      refreshBalance();
      return true;
    } catch {
      toast({ title: "Credit Error", description: "Could not deduct credits. Please try again.", variant: "destructive" });
      return false;
    } finally {
      setIsDeducting(false);
    }
  };

  /** Gives credits back when the AI call fails after a successful deduction. */
  const refund = async (amount: number, reason = "tutorial_platform_ai_refund") => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await (supabase as any).rpc("add_ai_credits", {
        p_user_id: user.id,
        p_amount: amount,
        p_reason: reason,
        p_source: "tutorial_platform",
      });
      refreshBalance();
    } catch {
      /* non-fatal */
    }
  };

  return { credits, isLoading, isDeducting, checkAndDeduct, refund };
};
