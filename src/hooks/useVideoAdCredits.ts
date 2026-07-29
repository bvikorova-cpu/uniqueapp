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

      // Unified wallet: balance always comes from ai_credits
      const { data: wallet, error: walletError } = await supabase
        .from("ai_credits")
        .select("credits_remaining")
        .eq("user_id", user.id)
        .maybeSingle();
      if (walletError) throw walletError;

      const { data: tierRow } = await supabase
        .from("video_ad_credits")
        .select("tier, subscription_end_date")
        .eq("user_id", user.id)
        .maybeSingle();

      return {
        credits_remaining: wallet?.credits_remaining ?? 0,
        tier: (tierRow?.tier as 'pro' | 'agency') ?? 'pro',
        subscription_end_date: tierRow?.subscription_end_date ?? undefined,
      } as VideoAdCredits;
    } });


  const generateVideoAd = useMutation({
    mutationFn: async (params: GenerateVideoAdParams) => {
      const { data, error } = await supabase.functions.invoke('video-ad-tools', {
        body: { action: 'generate_script', ...params } });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      // Edge function returns { result, credits_used } — unwrap to the script object
      return data?.result ?? data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-ad-credits"] });
      queryClient.invalidateQueries({ queryKey: ["video-ad-history"] });
      queryClient.invalidateQueries({ queryKey: ["video-ad-stats"] });

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
    } });

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
      const PRICE_PER_CREDIT = 80; // cents, EUR
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to buy credits");
        return null;
      }
      const { data, error } = await supabase.functions.invoke('create-one-off-payment', {
        body: {
          productKey: 'video_ad_credits',
          amount: Math.max(100, Math.round(credits * PRICE_PER_CREDIT)),
          name: `${credits} Video Ad Credits`,
          // verify-credits-payment reads user_id / credits / credit_type from session metadata.
          // Credits land in the unified ai_credits wallet.
          metadata: {
            type: 'ai_credits',
            product: 'ai_credits',
            credits: String(credits),
            credit_type: 'ai_credits',
            user_id: user.id
          }
        }
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

  return { credits,
    isLoading,
    generateVideoAd: generateVideoAd.mutateAsync,
    isGenerating: generateVideoAd.isPending,
    getTierLimits,
    calculateCreditCost,
    purchaseCredits };
};
