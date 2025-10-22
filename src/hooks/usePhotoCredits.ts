import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePhotoCredits = () => {
  const queryClient = useQueryClient();

  const { data: credits, isLoading } = useQuery({
    queryKey: ["photo-credits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("photo_credits")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      // If no credits record exists, create one
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from("photo_credits")
          .insert({
            user_id: user.id,
            credits_remaining: 0,
            total_credits_purchased: 0
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newData;
      }

      return data;
    },
  });

  const restorePhoto = useMutation({
    mutationFn: async ({ imageUrl, restorationType }: { imageUrl: string; restorationType: 'colorize' | 'repair' | 'enhance' }) => {
      const { data, error } = await supabase.functions.invoke('restore-old-photo', {
        body: { imageUrl, restorationType }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photo-credits"] });
    },
    onError: (error: Error) => {
      if (error.message.includes('credits')) {
        toast.error("Insufficient credits. Please purchase more credits.");
      } else if (error.message.includes('Rate limit')) {
        toast.error("Too many requests. Please try again later.");
      } else {
        toast.error("Error restoring photo: " + error.message);
      }
    },
  });

  const purchaseCredits = async (amount: number) => {
    try {
      // This will be implemented with Stripe later
      toast.info("Payment system coming soon!");
    } catch (error) {
      toast.error("Error purchasing credits");
    }
  };

  return {
    credits,
    isLoading,
    restorePhoto: restorePhoto.mutate,
    isRestoring: restorePhoto.isPending,
    purchaseCredits,
  };
};
