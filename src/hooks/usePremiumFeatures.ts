import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PremiumFeature {
  id: string;
  feature_name: string;
  feature_type: string;
  credit_cost: number;
  description: string;
  icon: string;
}

interface PremiumBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  credit_cost: number;
  rarity: string;
}

interface PremiumTheme {
  id: string;
  name: string;
  description: string;
  credit_cost: number;
  theme_data: any;
}

interface PremiumAvatar {
  id: string;
  name: string;
  description: string;
  avatar_url: string;
  is_animated: boolean;
  credit_cost: number;
  rarity: string;
}

export const usePremiumFeatures = () => {
  const [storyEffects, setStoryEffects] = useState<PremiumFeature[]>([]);
  const [livestreamGifts, setLivestreamGifts] = useState<PremiumFeature[]>([]);
  const [datingGifts, setDatingGifts] = useState<PremiumFeature[]>([]);
  const [premiumBadges, setPremiumBadges] = useState<PremiumBadge[]>([]);
  const [premiumThemes, setPremiumThemes] = useState<PremiumTheme[]>([]);
  const [premiumAvatars, setPremiumAvatars] = useState<PremiumAvatar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPremiumFeatures();
  }, []);

  const loadPremiumFeatures = async () => {
    try {
      // Load premium features
      const { data: features } = await supabase
        .from('premium_features')
        .select('*')
        .eq('is_active', true);

      if (features) {
        setStoryEffects(features.filter(f => f.feature_type === 'story_effect'));
        setLivestreamGifts(features.filter(f => f.feature_type === 'livestream_gift'));
        setDatingGifts(features.filter(f => f.feature_type === 'dating_gift'));
      }

      // Load premium badges
      const { data: badges } = await supabase
        .from('premium_badges')
        .select('*')
        .eq('is_active', true);

      if (badges) setPremiumBadges(badges);

      // Load premium themes
      const { data: themes } = await supabase
        .from('premium_themes')
        .select('*')
        .eq('is_active', true);

      if (themes) setPremiumThemes(themes);

      // Load premium avatars
      const { data: avatars } = await supabase
        .from('premium_avatars')
        .select('*')
        .eq('is_active', true);

      if (avatars) setPremiumAvatars(avatars);

    } catch (error) {
      console.error('Load premium features error:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseFeature = async (
    featureId: string,
    featureName: string,
    creditsSpent: number
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Check if user has enough credits
      const { data: creditsData } = await supabase
        .from('ai_credits')
        .select('credits_remaining')
        .eq('user_id', user.id)
        .single();

      if (!creditsData || creditsData.credits_remaining < creditsSpent) {
        return false;
      }

      // Deduct credits
      const { error: updateError } = await supabase
        .from('ai_credits')
        .update({
          credits_remaining: creditsData.credits_remaining - creditsSpent,
          last_used_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Record purchase
      await supabase
        .from('user_premium_purchases')
        .insert({
          user_id: user.id,
          feature_id: featureId,
          feature_name: featureName,
          credits_spent: creditsSpent,
        });

      // Log usage
      await supabase
        .from('ai_usage_history')
        .insert({
          user_id: user.id,
          usage_type: 'premium_feature',
          credits_used: creditsSpent,
          description: featureName,
        });

      return true;
    } catch (error) {
      console.error('Purchase feature error:', error);
      return false;
    }
  };

  return {
    storyEffects,
    livestreamGifts,
    datingGifts,
    premiumBadges,
    premiumThemes,
    premiumAvatars,
    purchaseFeature,
    loading,
  };
};