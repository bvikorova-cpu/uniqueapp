import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VideoAdCredits {
  credits_remaining: number;
  tier: 'pro' | 'agency';
  subscription_end_date?: string;
}

interface GenerateVideoAdParams {
  productService: string;
  targetAudience: string;
  keyMessage: string;
  tone: string;
  duration: number;
  platform: string;
  premiumFeatures?: {
    competitiveAnalysis?: boolean;
    abTesting?: boolean;
    voiceActorSuggestions?: boolean;
    budgetOptimizer?: boolean;
    multiLanguage?: string[];
    storyboardExport?: boolean;
    brandVoiceMatching?: boolean;
    performancePredictions?: boolean;
  };
}

export const useVideoAdCredits = () => {
  const queryClient = useQueryClient();

  const { data: credits, isLoading } = useQuery({
    queryKey: ["video-ad-credits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Kontrola admin statusu
      const { data: adminRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (adminRole) {
        return {
          credits_remaining: 999999,
          tier: 'agency' as const,
          subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        };
      }

      const { data, error } = await supabase
        .from("video_ad_credits")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from("video_ad_credits")
          .insert({
            user_id: user.id,
            credits_remaining: 50,
            tier: 'pro'
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newData as VideoAdCredits;
      }

      return data as VideoAdCredits;
    },
  });

  const generateVideoAd = useMutation({
    mutationFn: async (params: GenerateVideoAdParams) => {
      const { data, error } = await supabase.functions.invoke('video-ad-tools', {
        body: { action: 'generate_script', ...params },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      // Edge function returns { result, credits_used } — unwrap to the script object
      return data?.result ?? data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-ad-credits"] });
      queryClient.invalidateQueries({ queryKey: ["video-ad-history"] });
      toast.success("Video ad generated successfully!");
    },
    onError: (error: Error) => {
      if (error.message.includes('credits') || error.message.includes('Insufficient')) {
        toast.error("Insufficient credits. Please upgrade your plan.");
      } else if (error.message.includes('Rate limit')) {
        toast.error("Too many requests. Please try again later.");
      } else if (error.message.includes('authenticated')) {
        toast.error("Please log in to generate video ads.");
      } else {
        toast.error("Error generating video ad: " + error.message);
      }
    },
  });

  const getTierLimits = (tier: string) => {
    switch (tier) {
      case 'pro':
        return {
          dailyLimit: Infinity,
          maxDuration: 120,
          features: ['basic', 'advanced'],
          creditsPerVideo: 0 // unlimited basic
        };
      case 'agency':
        return {
          dailyLimit: Infinity,
          maxDuration: 300,
          features: ['basic', 'advanced', 'premium'],
          creditsPerVideo: 0 // unlimited all
        };
      default:
        return {
          dailyLimit: 1,
          maxDuration: 30,
          features: ['basic'],
          creditsPerVideo: 1
        };
    }
  };

  const calculateCreditCost = (params: GenerateVideoAdParams) => {
    let cost = 1; // Base cost
    
    const features = params.premiumFeatures || {};
    
    // Advanced features (2 credits each)
    if (features.competitiveAnalysis) cost += 2;
    if (features.abTesting) cost += 2;
    if (features.voiceActorSuggestions) cost += 2;
    if (features.budgetOptimizer) cost += 2;
    
    // Premium features (3 credits each)
    if (features.multiLanguage && features.multiLanguage.length > 0) {
      cost += features.multiLanguage.length * 3;
    }
    if (features.storyboardExport) cost += 3;
    if (features.brandVoiceMatching) cost += 3;
    if (features.performancePredictions) cost += 3;
    
    return cost;
  };

  const purchaseCredits = async (credits: number): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('create-video-ad-credits-payment', {
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

  return {
    credits,
    isLoading,
    generateVideoAd: generateVideoAd.mutateAsync,
    isGenerating: generateVideoAd.isPending,
    getTierLimits,
    calculateCreditCost,
    purchaseCredits,
  };
};
