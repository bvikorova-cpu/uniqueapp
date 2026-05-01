import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useHandwritingCredits = () => {
  const queryClient = useQueryClient();

  const { data: credits, isLoading } = useQuery({
    queryKey: ["handwriting-credits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("handwriting_credits")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from("handwriting_credits")
          .insert({
            user_id: user.id,
            credits_remaining: 0,
            total_credits_purchased: 0,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newData;
      }

      return data;
    },
  });

  const analyzeHandwriting = useMutation({
    mutationFn: async ({ imageUrl, analysisType }: { imageUrl: string; analysisType: string }) => {
      const { data, error } = await supabase.functions.invoke("handwriting-ai", {
        body: { action: "analyze", imageUrl, analysisType },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["handwriting-credits"] });
      queryClient.invalidateQueries({ queryKey: ["handwriting-analyses"] });
    },
    onError: (error: Error) => {
      if (error.message.includes("credits")) {
        toast.error("Insufficient credits. Please purchase more credits.");
      } else {
        toast.error("Error analyzing handwriting: " + error.message);
      }
    },
  });

  const purchaseCredits = async (credits: number): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke("create-handwriting-credits-payment", {
        body: { credits },
      });

      if (error) throw error;

      if (data?.url) {
        return data.url;
      }
      return null;
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error creating payment session");
      return null;
    }
  };

  return {
    credits,
    isLoading,
    analyzeHandwriting: analyzeHandwriting.mutate,
    isAnalyzing: analyzeHandwriting.isPending,
    purchaseCredits,
  };
};
