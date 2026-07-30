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

      const [paid, free] = await Promise.all([
        supabase.from("ai_credits").select("credits_remaining,total_credits_purchased,last_used_at").eq("user_id", user.id).maybeSingle(),
        (supabase as any).from("free_tier_credits").select("balance").eq("user_id", user.id).maybeSingle(),
      ]);
      if (paid.error) throw paid.error;
      if (free.error) throw free.error;
      return {
        credits_remaining: (paid.data?.credits_remaining ?? 0) + ((free.data as any)?.balance ?? 0),
        total_credits_purchased: paid.data?.total_credits_purchased ?? 0,
        last_used_at: paid.data?.last_used_at ?? null,
      };
    } });

  const restorePhoto = useMutation({
    mutationFn: async ({ imageUrl, restorationType }: { imageUrl: string; restorationType: 'colorize' | 'repair' | 'enhance' }) => {
      const action =
        restorationType === 'colorize' ? 'photo_colorize'
        : restorationType === 'repair' ? 'photo_repair'
        : 'photo_enhance';

      const { data, error } = await supabase.functions.invoke('photo-face-ai', {
        body: { action, sourceUrl: imageUrl }
      });

      if (error) {
        const ctx = (error as any)?.context;
        let msg = error.message;
        try { if (ctx?.json) { const b = await ctx.json(); if (b?.error) msg = b.error; } } catch { /* noop */ }
        throw new Error(msg);
      }
      if ((data as any)?.error) throw new Error((data as any).error);
      return { ...data, restoredImageUrl: (data as any)?.resultUrl };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photo-credits"] });
      queryClient.invalidateQueries({ queryKey: ["ai-credits"] });
      queryClient.invalidateQueries({ queryKey: ["free-tier-credits"] });
      window.dispatchEvent(new Event("ai-credits-updated"));
    },
    onError: (error: Error) => {
      if (error.message.includes('credits')) {
        toast.error("Insufficient credits. Please purchase more credits.");
      } else if (error.message.includes('Rate limit')) {
        toast.error("Too many requests. Please try again later.");
      } else {
        toast.error("Error restoring photo: " + error.message);
      }
    } });

  const purchaseCredits = async (credits: number, price: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to purchase credits");
        return;
      }

      // Send `amount` (in cents) + metadata.credits so create-checkout uses the
      // product path with our package price instead of falling into the credits/CREDIT_PACKS branch.
      const origin = window.location.origin;
      const { data, error } = await supabase.functions.invoke('create-photo-credits-payment', {
        body: {
          product: 'photo_credits',
          amount: Math.round(price * 100),
          productName: `Photo Restoration Credits (${credits})`,
          metadata: { credits: String(credits), credit_type: 'photo' },
          successUrl: `${origin}/photo-restoration?payment=success&product_type=photo_credits&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${origin}/photo-restoration?payment=canceled` } });

      if (error) throw error;

      if (data?.url) {
        { const __w = window.open(data.url, "_blank", "noopener,noreferrer"); if (!__w) { const __w = window.open(data.url, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = data.url; } }
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error("Error creating payment session");
    }
  };

  return { credits,
    isLoading,
    restorePhoto: restorePhoto.mutate,
    isRestoring: restorePhoto.isPending,
    purchaseCredits };
};
