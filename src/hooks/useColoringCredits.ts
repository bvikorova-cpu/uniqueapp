import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsAdmin } from "./useIsAdmin";
import { useKidsGoldPass } from "./useKidsGoldPass";

export const useColoringCredits = () => {
  const queryClient = useQueryClient();
  const { isAdmin } = useIsAdmin();
  const { hasGoldPass } = useKidsGoldPass();

  const { data: credits, isLoading } = useQuery({
    queryKey: ["coloring-credits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("coloring_credits")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      // If no credits record exists, create one
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from("coloring_credits")
          .insert({
            user_id: user.id,
            credits_remaining: 0,
            tier: 'none'
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newData;
      }

      return data;
    },
    enabled: true,
  });

  // Admin and Gold Pass users have unlimited premium credits
  const effectiveCredits = (isAdmin || hasGoldPass) && credits
    ? { ...credits, credits_remaining: 999999, tier: 'premium' as const } 
    : credits;

  const checkSubscription = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke(
        "check-coloring-subscription"
      );
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coloring-credits"] });
      toast.success("Subscription status updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to check subscription: " + error.message);
    },
  });

  return {
    credits: effectiveCredits,
    isLoading,
    hasGoldPassAccess: hasGoldPass,
    checkSubscription: checkSubscription.mutate,
    isCheckingSubscription: checkSubscription.isPending,
  };
};
