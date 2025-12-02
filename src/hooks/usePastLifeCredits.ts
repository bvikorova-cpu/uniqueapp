import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePastLifeCredits = () => {
  const queryClient = useQueryClient();

  const { data: credits, isLoading } = useQuery({
    queryKey: ["past-life-credits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("past_life_credits")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      
      if (!data) {
        const { data: newCredits, error: insertError } = await supabase
          .from("past_life_credits")
          .insert({ user_id: user.id })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newCredits;
      }

      return data;
    },
  });

  const analyzePastLife = useMutation({
    mutationFn: async (params: {
      birthDate: string;
      dreamsDejavu?: string;
      talentsPhobias?: string;
      readingType: string;
      partnerBirthDate?: string;
      partnerInfo?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("analyze-past-life", {
        body: params,
      });

      if (error) throw error;
      if (data.error) {
        if (data.requiresPayment) {
          throw new Error("INSUFFICIENT_CREDITS");
        }
        throw new Error(data.error);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["past-life-credits"] });
      queryClient.invalidateQueries({ queryKey: ["past-life-readings"] });
    },
    onError: (error: Error) => {
      if (error.message === "INSUFFICIENT_CREDITS") {
        toast.error("Insufficient credits. Please purchase more credits to continue.");
      } else {
        toast.error(error.message || "Failed to generate past life reading");
      }
    },
  });

  const purchaseCredits = async (amount: number) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-past-life-credits-payment",
        { body: { credits: amount } }
      );

      if (error) throw error;
      return data.url;
    } catch (error) {
      console.error("Error purchasing credits:", error);
      toast.error("Failed to initiate payment");
      return null;
    }
  };

  return {
    credits,
    isLoading,
    analyzePastLife: analyzePastLife.mutate,
    isAnalyzing: analyzePastLife.isPending,
    purchaseCredits,
  };
};