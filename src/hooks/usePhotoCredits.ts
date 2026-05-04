import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsAdmin } from "./useIsAdmin";

export const usePhotoCredits = () => {
  const queryClient = useQueryClient();
  const { isAdmin } = useIsAdmin();

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

  // Admin má vždy neobmedzené kredity
  const effectiveCredits = isAdmin && credits
    ? { ...credits, credits_remaining: 999999 } 
    : credits;

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

  const purchaseCredits = async (credits: number, price: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to purchase credits");
        return;
      }

      // Send `amount` (in cents) + metadata.credits so create-checkout uses the
      // product path with our package price instead of falling into the credits/CREDIT_PACKS branch.
      const { data, error } = await supabase.functions.invoke('create-photo-credits-payment', {
        body: {
          product: 'photo_credits',
          amount: Math.round(price * 100),
          productName: `Photo Restoration Credits (${credits})`,
          metadata: { credits: String(credits), credit_type: 'photo' },
        },
      });

      if (error) throw error;

      if (data?.url) {
        { const __w = window.open(data.url, "_blank", "noopener,noreferrer"); if (!__w) { const __w = window.open(data.url, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = data.url; } }
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error("Error creating payment session");
    }
  };

  return {
    credits: effectiveCredits,
    isLoading,
    restorePhoto: restorePhoto.mutate,
    isRestoring: restorePhoto.isPending,
    purchaseCredits,
  };
};
