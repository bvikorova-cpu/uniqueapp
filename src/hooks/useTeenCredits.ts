import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Per-action credit costs for Teen modules
export const TEEN_CREDIT_COSTS = {
  homework_pro: 4,
  essay_coach: 5,
  mental_wellness: 3,
  study_planner: 3,
  skill_builder: 4,
  social_coach: 3,
} as const;

export type TeenModuleKey = keyof typeof TEEN_CREDIT_COSTS;

export function useTeenCredits(module?: TeenModuleKey) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["teen-credits", user?.id],
    queryFn: async () => {
      if (!user) return { credits_remaining: 0, total_credits_purchased: 0 };
      const { data } = await supabase
        .from("teen_credits")
        .select("credits_remaining, total_credits_purchased")
        .eq("user_id", user.id)
        .maybeSingle();
      return data || { credits_remaining: 0, total_credits_purchased: 0 };
    },
    enabled: !!user,
  });

  const balance = data?.credits_remaining ?? 0;
  const cost = module ? TEEN_CREDIT_COSTS[module] : 0;
  const canUse = module ? balance >= cost : balance > 0;

  const purchase = async (credits: number) => {
    const { data: res, error } = await supabase.functions.invoke("create-checkout", {
      body: { credits, creditType: "teen_hub" },
    });
    if (error || !res?.url) {
      toast.error("Failed to start checkout");
      return null;
    }
    return res.url as string;
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["teen-credits"] });
    refetch();
  };

  return { balance, canUse, isLoading, purchase, refresh, costPerUse: cost };
}
