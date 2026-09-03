import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { safeInvoke } from "@/utils/safeInvoke";

interface CreditBalance {
  handwriting: number;
  pastLife: number;
  anonymousDate: number;
  lieDetector: number;
  creativeForge: number;
  creativeForgeFree: number;
  creativeForgePaid: number;
}

export const useUnifiedCredits = () => {
  const queryClient = useQueryClient();

  // Fetch all credit balances in parallel
  const { data: creditBalances, isLoading } = useQuery({
    queryKey: ["unified-credits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Single wallet: every module spends from `ai_credits`.
      const [paidAiRes, freeTierRes] = await Promise.all([
        supabase.from("ai_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle(),
        (supabase as any).from("free_tier_credits").select("balance").eq("user_id", user.id).maybeSingle(),
      ]);

      const creativeForgeFree = (freeTierRes.data as any)?.balance || 0;
      const creativeForgePaid = paidAiRes.data?.credits_remaining || 0;
      const wallet = creativeForgePaid;

      return { handwriting: wallet,
        pastLife: wallet,
        anonymousDate: wallet,
        lieDetector: wallet,
        creativeForge: creativeForgeFree + creativeForgePaid,
        creativeForgeFree,
        creativeForgePaid } as CreditBalance;
    } });

  // Unified wallet balance (no per-module silos)
  const totalCredits = creditBalances ? creditBalances.creativeForge : 0;


  // Purchase credits for a specific service
  const purchaseCredits = async (
    service: "handwriting" | "pastLife" | "anonymousDate" | "lieDetector" | "creativeForge",
    amount: number
  ): Promise<string | null> => { const functionMap = {
      handwriting: "create-handwriting-credits-payment",
      pastLife: "create-past-life-credits-payment",
      anonymousDate: "create-anonymous-date-payment",
      lieDetector: "create-lie-detector-payment",
      creativeForge: "create-creative-forge-payment" };

    const { data, error } = await safeInvoke(
      functionMap[service],
      { body: { credits: amount } }
    );

    if (error) {
      toast.error("Failed to initiate payment");
      return null;
    }
    return data?.url || null;
  };

  // Refresh all credit balances
  const refreshCredits = () => {
    queryClient.invalidateQueries({ queryKey: ["unified-credits"] });
    queryClient.invalidateQueries({ queryKey: ["handwriting-credits"] });
    queryClient.invalidateQueries({ queryKey: ["past-life-credits"] });
    queryClient.invalidateQueries({ queryKey: ["lie-detector-credits"] });
    queryClient.invalidateQueries({ queryKey: ["creative-forge-credits"] });
  };

  return { creditBalances,
    totalCredits,
    isLoading,
    purchaseCredits,
    refreshCredits };
};

// Global credit packages - shared pricing across services
export const GLOBAL_CREDIT_PACKAGES = [
  { credits: 30, price: 8, label: "Starter", description: "Perfect for trying out" },
  { credits: 75, price: 18, label: "Creator", description: "Great for regular use" },
  { credits: 150, price: 32, label: "Professional", popular: true, description: "Most popular choice" },
  { credits: 400, price: 75, label: "Studio", bestValue: true, description: "Best value for power users" },
];
