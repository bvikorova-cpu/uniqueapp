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

      // Unified AI credits pool (single source of truth)
      const { data, error } = await supabase
        .from("ai_credits")
        .select("credits_remaining")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      return { credits_remaining: data?.credits_remaining ?? 0 };
    } });

  const analyzeHandwriting = useMutation({
    mutationFn: async ({ imageUrl, analysisType }: { imageUrl: string; analysisType: string }) => {
      const { data, error } = await supabase.functions.invoke("handwriting-router", {
        body: { action: "analyze", imageUrl, analysisType } });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["handwriting-credits"] });
      queryClient.invalidateQueries({ queryKey: ["handwriting-analyses"] });
      queryClient.invalidateQueries({ queryKey: ["handwriting-stats"] });
    },
    onError: (error: Error) => {
      if (error.message.includes("credits")) {
        toast.error("Insufficient credits. Please purchase more credits.");
      } else {
        toast.error("Error analyzing handwriting: " + error.message);
      }
    } });

  const purchaseCredits = async (credits: number): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke("create-handwriting-credits-payment", {
        body: { credits } });

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

  return { credits,
    isLoading,
    analyzeHandwriting: analyzeHandwriting.mutate,
    isAnalyzing: analyzeHandwriting.isPending,
    purchaseCredits };
};
