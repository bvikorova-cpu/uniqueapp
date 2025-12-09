import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TutoringCredits {
  id: string;
  user_id: string;
  credits_remaining: number;
  total_credits_purchased: number;
  created_at: string;
  updated_at: string;
}

export const TUTORING_CREDIT_PACKAGES = [
  {
    id: "price_1ScY0zGaXSfGtYFtoe91oxmX",
    credits: 10,
    price: 5,
    label: "Starter",
  },
  {
    id: "price_1ScY10GaXSfGtYFt3F1cPJaE",
    credits: 30,
    price: 12,
    label: "Popular",
    popular: true,
  },
  {
    id: "price_1ScY12GaXSfGtYFt3zw96KfT",
    credits: 100,
    price: 35,
    label: "Best Value",
    bestValue: true,
  },
];

export const useTutoringCredits = () => {
  const queryClient = useQueryClient();

  const { data: credits, isLoading } = useQuery({
    queryKey: ["tutoring-credits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("tutoring_credits")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      return data as TutoringCredits | null;
    },
  });

  const useCredit = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: currentCredits } = await supabase
        .from("tutoring_credits")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!currentCredits || currentCredits.credits_remaining < 1) {
        throw new Error("Insufficient credits");
      }

      const { error } = await supabase
        .from("tutoring_credits")
        .update({
          credits_remaining: currentCredits.credits_remaining - 1,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutoring-credits"] });
    },
  });

  const purchaseCredits = useMutation({
    mutationFn: async (priceId: string) => {
      const { data, error } = await supabase.functions.invoke("tutoring-purchase-credits", {
        body: { priceId },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    },
    onError: (error) => {
      console.error("Purchase error:", error);
      toast.error("Failed to start purchase");
    },
  });

  const addCredits = useMutation({
    mutationFn: async (creditsToAdd: number) => {
      const { error } = await supabase.functions.invoke("tutoring-add-credits", {
        body: { credits: creditsToAdd },
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutoring-credits"] });
      toast.success("Credits added successfully!");
    },
    onError: (error) => {
      console.error("Add credits error:", error);
      toast.error("Failed to add credits");
    },
  });

  return {
    credits: credits?.credits_remaining ?? 0,
    totalPurchased: credits?.total_credits_purchased ?? 0,
    isLoading,
    useCredit: useCredit.mutateAsync,
    purchaseCredits: purchaseCredits.mutate,
    addCredits: addCredits.mutate,
    isUsingCredit: useCredit.isPending,
  };
};
