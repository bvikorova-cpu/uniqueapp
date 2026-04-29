import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const SCIENCE_CREDITS_PER_RUN = 4;

interface ScienceCreditsState {
  credits_remaining: number;
  total_credits_purchased: number;
  loading: boolean;
}

/**
 * Paid-only science credits (4 credits per AI analysis).
 * Backed by `science_credits` table + universal `create-checkout` router.
 */
export const useScienceCredits = () => {
  const [state, setState] = useState<ScienceCreditsState>({
    credits_remaining: 0,
    total_credits_purchased: 0,
    loading: true,
  });

  const refresh = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState({ credits_remaining: 0, total_credits_purchased: 0, loading: false });
        return;
      }

      const { data, error } = await supabase
        .from("science_credits")
        .select("credits_remaining, total_credits_purchased")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setState({
          credits_remaining: data.credits_remaining ?? 0,
          total_credits_purchased: data.total_credits_purchased ?? 0,
          loading: false,
        });
      } else {
        // Lazy-create row
        await supabase
          .from("science_credits")
          .insert({ user_id: user.id, credits_remaining: 0, total_credits_purchased: 0 });
        setState({ credits_remaining: 0, total_credits_purchased: 0, loading: false });
      }
    } catch (e) {
      console.error("Load science credits error:", e);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const purchaseCredits = useCallback(async (credits: number): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to buy Science credits.");
        return null;
      }
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { credits, creditType: "science" },
      });
      if (error) throw error;
      return data?.url || null;
    } catch (e: any) {
      console.error("Science purchase error:", e);
      toast.error(e?.message || "Failed to start checkout");
      return null;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    ...state,
    canRun: state.credits_remaining >= SCIENCE_CREDITS_PER_RUN,
    refresh,
    purchaseCredits,
  };
};
