import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AstrologyCredits } from "@/types/credits";
import { invokeOrThrow, safeInvoke } from "@/utils/safeInvoke";

export const CREDIT_COSTS = {
  tarot_3: 3,
  tarot_5: 5,
  tarot_10: 10,
  tarot_premium: 15,
  horoscope_daily: 1,
  horoscope_weekly: 3,
  horoscope_monthly: 8,
  horoscope_yearly: 25,
  dream: 5,
  numerology_basic: 5,
  numerology_compatibility: 8,
  numerology_full: 15,
  palmistry: 10,
  love_compatibility: 7,
  yes_no: 2,
  birth_chart: 20,
  rune: 1,
  mystic_chat: 1,
} as const;

export type ReadingType = keyof typeof CREDIT_COSTS;

export const useAstrologyCredits = () => {
  const queryClient = useQueryClient();

  const { data: credits, isLoading } = useQuery<AstrologyCredits>({
    queryKey: ["astrology-credits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("astrology_credits")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from("astrology_credits")
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

  const performReading = useMutation({
    mutationFn: async ({ readingType, data }: { readingType: string; data: Record<string, unknown> }) => {
      return invokeOrThrow('astrology-reading', {
        body: { type: readingType, data }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["astrology-credits"] });
    },
    onError: (error: Error) => {
      if (error.message.includes('credits') || error.message.includes('Insufficient')) {
        toast.error("Insufficient credits. Please purchase more credits.");
      } else if (error.message.includes('Rate limit')) {
        toast.error("Too many requests. Please try again later.");
      } else {
        toast.error("Error performing reading. Please try again.");
      }
    },
  });

  const purchaseCredits = async (credits: number): Promise<string | null> => {
    const { data, error } = await safeInvoke('create-astrology-credits-payment', {
      body: { credits }
    });
    
    if (error) {
      toast.error("Error creating payment session");
      return null;
    }
    
    return data?.url || null;
  };

  return {
    credits,
    isLoading,
    performReading: performReading.mutate,
    isPerformingReading: performReading.isPending,
    purchaseCredits,
  };
};
