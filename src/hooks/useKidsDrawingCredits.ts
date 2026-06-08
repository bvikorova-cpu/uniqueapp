import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const KIDS_DRAWING_CREDIT_COST = 4; // 4 credits per AI drawing operation (matrix)

export function useKidsDrawingCredits() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["kids-drawing-credits", user?.id],
    queryFn: async () => {
      if (!user) return { credits_remaining: 0, total_credits_purchased: 0 };
      const { data } = await supabase
        .from("kids_drawing_credits")
        .select("credits_remaining, total_credits_purchased")
        .eq("user_id", user.id)
        .maybeSingle();
      return data || { credits_remaining: 0, total_credits_purchased: 0 };
    },
    enabled: !!user,
  });

  const balance = data?.credits_remaining ?? 0;
  const canUse = balance >= KIDS_DRAWING_CREDIT_COST;

  const purchase = async (credits: number) => {
    const { data: res, error } = await supabase.functions.invoke("create-checkout", {
      body: { credits, creditType: "kids_drawing" },
    });
    if (error || !res?.url) {
      toast.error("Failed to start checkout");
      return null;
    }
    return res.url as string;
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["kids-drawing-credits"] });
    refetch();
  };

  return { balance, canUse, isLoading, purchase, refresh, costPerUse: KIDS_DRAWING_CREDIT_COST };
}
