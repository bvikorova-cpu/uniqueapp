import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreditBalance {
  handwriting: number;
  pastLife: number;
  anonymousDate: number;
  lieDetector: number;
  creativeForge: number;
}

export const useUnifiedCredits = () => {
  const queryClient = useQueryClient();

  // Fetch all credit balances in parallel
  const { data: creditBalances, isLoading } = useQuery({
    queryKey: ["unified-credits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch all credit tables in parallel
      const [
        handwritingRes,
        pastLifeRes,
        anonymousDateRes,
        lieDetectorRes,
        creativeForgeRes,
      ] = await Promise.all([
        supabase.from("handwriting_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle(),
        supabase.from("past_life_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle(),
        supabase.from("anonymous_dating_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle(),
        supabase.from("lie_detector_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle(),
        supabase.from("creative_forge_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle(),
      ]);

      return {
        handwriting: handwritingRes.data?.credits_remaining || 0,
        pastLife: pastLifeRes.data?.credits_remaining || 0,
        anonymousDate: anonymousDateRes.data?.credits_remaining || 0,
        lieDetector: lieDetectorRes.data?.credits_remaining || 0,
        creativeForge: creativeForgeRes.data?.credits_remaining || 0,
      } as CreditBalance;
    },
  });

  // Calculate total credits
  const totalCredits = creditBalances
    ? Object.values(creditBalances).reduce((sum, val) => sum + val, 0)
    : 0;

  // Purchase credits for a specific service
  const purchaseCredits = async (
    service: keyof CreditBalance,
    amount: number
  ): Promise<string | null> => {
    try {
      const functionMap = {
        handwriting: "create-handwriting-credits-payment",
        pastLife: "create-past-life-credits-payment",
        anonymousDate: "create-anonymous-date-payment",
        lieDetector: "create-lie-detector-payment",
        creativeForge: "create-creative-forge-payment",
      };

      const { data, error } = await supabase.functions.invoke(
        functionMap[service],
        { body: { credits: amount } }
      );

      if (error) throw error;
      return data?.url || null;
    } catch (error) {
      console.error("Error purchasing credits:", error);
      toast.error("Failed to initiate payment");
      return null;
    }
  };

  // Refresh all credit balances
  const refreshCredits = () => {
    queryClient.invalidateQueries({ queryKey: ["unified-credits"] });
    queryClient.invalidateQueries({ queryKey: ["handwriting-credits"] });
    queryClient.invalidateQueries({ queryKey: ["past-life-credits"] });
    queryClient.invalidateQueries({ queryKey: ["lie-detector-credits"] });
    queryClient.invalidateQueries({ queryKey: ["creative-forge-credits"] });
  };

  return {
    creditBalances,
    totalCredits,
    isLoading,
    purchaseCredits,
    refreshCredits,
  };
};

// Global credit packages - shared pricing across services
export const GLOBAL_CREDIT_PACKAGES = [
  { credits: 30, price: 8, label: "Starter", description: "Perfect for trying out" },
  { credits: 75, price: 18, label: "Creator", description: "Great for regular use" },
  { credits: 150, price: 32, label: "Professional", popular: true, description: "Most popular choice" },
  { credits: 400, price: 75, label: "Studio", bestValue: true, description: "Best value for power users" },
];
