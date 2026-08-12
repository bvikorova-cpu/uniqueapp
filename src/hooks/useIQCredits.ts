import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { IQCredits } from "@/types/credits";

export const useIQCredits = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: credits, isLoading } = useQuery<IQCredits>({
    queryKey: ["iq-credits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("ai_credits")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      
      // If no record exists, create one
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from("ai_credits")
          .select("*")
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newData;
      }

      return data;
    } });

  const purchaseCredits = useMutation({
    mutationFn: async (credits: number) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("create-iq-payment", {
        body: { credits },
        headers: {
          Authorization: `Bearer ${session.access_token}` } });

      if (error) throw error;
      return data.url;
    },
    onSuccess: (url) => {
      if (url) {
        { const __w = window.open(url, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = url; }
      }
    },
    onError: (error) => { toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initiate payment",
        variant: "destructive" });
    } });

  const spendCredits = useMutation({
    mutationFn: async (amount: number) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (!credits || ((credits as any).credits_remaining ?? 0) < amount) {
        throw new Error("Insufficient credits");
      }

      const { error } = await supabase
        .from("ai_credits")
        .update({ credits_remaining: (credits as any).credits_remaining - amount })
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["iq-credits"] });
    } });

  return { credits: (credits as any)?.credits_remaining || 0,
    isLoading,
    purchaseCredits: purchaseCredits.mutate,
    isPurchasing: purchaseCredits.isPending,
    spendCredits: spendCredits.mutateAsync };
};
