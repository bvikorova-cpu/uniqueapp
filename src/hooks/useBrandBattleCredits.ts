import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BrandBattleCreditsData {
  creditsBalance: number;
  totalCreditsEarned: number;
  totalCreditsSpent: number;
}

export const useBrandBattleCredits = () => {
  return useQuery<BrandBattleCreditsData>({
    queryKey: ["brand-battle-credits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          creditsBalance: 0,
          totalCreditsEarned: 0,
          totalCreditsSpent: 0,
        };
      }

      const { data, error } = await supabase
        .from("brand_battle_credits")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        return {
          creditsBalance: 0,
          totalCreditsEarned: 0,
          totalCreditsSpent: 0,
        };
      }

      return {
        creditsBalance: data.credits_balance,
        totalCreditsEarned: data.total_credits_earned,
        totalCreditsSpent: data.total_credits_spent,
      };
    },
  });
};
