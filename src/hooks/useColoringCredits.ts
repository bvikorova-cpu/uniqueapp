import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const COLORING_CREDIT_COST = 5; // 5 credits per coloring page generation

/**
 * Coloring Pages credits — paid-only model, consistent with other 7 modules.
 * Replaces legacy subscription/pay-per-use approach.
 */
export const useColoringCredits = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["coloring-credits", user?.id],
    queryFn: async () => {
      if (!user) return { credits_remaining: 0, total_credits_purchased: 0 };
      const { data } = await supabase
        .from("coloring_credits")
        .select("credits_remaining, total_credits_purchased")
        .eq("user_id", user.id)
        .maybeSingle();
      return data || { credits_remaining: 0, total_credits_purchased: 0 };
    },
    enabled: !!user,
  });

  const balance = data?.credits_remaining ?? 0;
  const canUse = balance >= COLORING_CREDIT_COST;

  const purchase = async (credits: number): Promise<string | null> => {
    if (!user) {
      toast.error("Please sign in to buy credits.");
      setTimeout(() => {
        window.location.href = `/auth?redirect=${encodeURIComponent(window.location.pathname)}`;
      }, 600);
      return null;
    }
    const { data: res, error } = await supabase.functions.invoke("create-checkout", {
      body: { credits, creditType: "coloring" },
    });
    if (error || !res?.url) {
      toast.error("Failed to start checkout. Please try again.");
      return null;
    }
    return res.url as string;
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["coloring-credits"] });
    refetch();
  };

  return {
    balance,
    canUse,
    isLoading,
    purchase,
    refresh,
    costPerUse: COLORING_CREDIT_COST,
    // Legacy compatibility — old components used `credits.credits_remaining`
    credits: data,
    checkSubscription: refresh,
  };
};
