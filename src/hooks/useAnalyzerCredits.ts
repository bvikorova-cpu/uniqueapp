import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AnalyzerCredits } from "@/types/credits";

export const useAnalyzerCredits = () => {
  const queryClient = useQueryClient();

  const { data: credits, isLoading } = useQuery<AnalyzerCredits>({
    queryKey: ["analyzer-credits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("analyzer_credits")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      // If no credits record exists, create one with basic tier
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from("analyzer_credits")
          .insert({
            user_id: user.id,
            credits_remaining: 10,
            total_credits_purchased: 10,
            tier: 'basic'
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newData;
      }

      return data;
    },
  });

  const analyzeImage = useMutation({
    mutationFn: async ({ 
      imageUrl, 
      category, 
      analysisType = 'basic' 
    }: { 
      imageUrl: string; 
      category: string;
      analysisType?: 'basic' | 'expert';
    }) => {
      const { data, error } = await supabase.functions.invoke('universal-vision-analyzer', {
        body: { imageUrl, category, analysisType }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analyzer-credits"] });
      queryClient.invalidateQueries({ queryKey: ["vision-analyses"] });
    },
    onError: (error: Error) => {
      if (error.message.includes('credits')) {
        toast.error("Insufficient credits. Please purchase more credits or upgrade your tier.");
      } else if (error.message.includes('Rate limit')) {
        toast.error("Too many requests. Please try again later.");
      } else {
        toast.error("Error analyzing image: " + error.message);
      }
    },
  });

  const purchaseCredits = async (credits: number): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('create-analyzer-credits-payment', {
        body: { credits }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        return data.url;
      }
      return null;
    } catch (error) {
      console.error('Error:', error);
      toast.error("Error creating payment session");
      return null;
    }
  };

  const getTierLimits = (tier: string) => {
    switch(tier) {
      case 'free':
        return { 
          dailyLimit: 1, 
          features: ['Basic identification', 'Text extraction (100 words)', 'Watermarked reports'] 
        };
      case 'basic':
        return { 
          monthlyLimit: 10, 
          features: ['Detailed analysis', 'Unlimited text', 'Translation', 'Shopping links', '30-day history', 'PDF export'] 
        };
      case 'pro':
        return { 
          monthlyLimit: 50, 
          features: ['AI chat follow-up', 'Batch upload', 'API access', 'Priority processing', 'Compare mode', 'Custom reports', '1-year history'] 
        };
      case 'expert':
        return { 
          unlimited: true, 
          features: ['Expert AI model', 'White-label reports', 'Team collaboration', 'Custom training', 'Priority support', 'Commercial use'] 
        };
      default:
        return { dailyLimit: 1, features: [] };
    }
  };

  return {
    credits,
    isLoading,
    analyzeImage: analyzeImage.mutate,
    isAnalyzing: analyzeImage.isPending,
    purchaseCredits,
    getTierLimits,
  };
};
