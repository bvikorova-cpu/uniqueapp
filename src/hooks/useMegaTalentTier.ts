import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type MegaTalentTier = 'premium' | 'top_premium' | null;

interface MegaTalentTierInfo {
  tier: MegaTalentTier;
  isSubscribed: boolean;
  bonusVotes: number;
  winChanceBoost: number;
  hasAlgorithmicBoost: boolean;
  loading: boolean;
  refetch: () => Promise<void>;
}

// Constants for tier benefits
export const TIER_BENEFITS = {
  premium: {
    price: 10,
    bonusVotes: 0,
    winChanceBoost: 0,
    algorithmicBoost: false,
    features: [
      'Unlimited uploads',
      'Access to all categories',
      'Voting & commenting',
      'Prize eligibility',
      'Referral program (€5/month per friend)',
    ],
  },
  top_premium: {
    price: 15,
    bonusVotes: 0,
    winChanceBoost: 100,
    algorithmicBoost: true,
    features: [
      'All Premium features',
      '100% Algorithmic Boost in rankings (real votes × 2)',
      'Priority display in category',
      'Exclusive TOP Premium badge',
      'Referral program (€5/month per friend)',
    ],
  },
} as const;

// TOP Premium ranking multiplier. Real vote count is always shown to users;
// this multiplier only affects ordering in the leaderboard.
export const TOP_PREMIUM_BOOST_MULTIPLIER = 2.0; // +100%
export const TOP_PREMIUM_BOOST_PERCENT = 100;

export const useMegaTalentTier = (): MegaTalentTierInfo => {
  const [tier, setTier] = useState<MegaTalentTier>(null);
  const [loading, setLoading] = useState(true);

  const fetchTier = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTier(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('megatalent_subscriptions')
        .select('tier, bonus_votes, win_chance_boost, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;

      setTier(data?.tier as MegaTalentTier || null);
    } catch (error) {
      console.error('Error fetching MegaTalent tier:', error);
      setTier(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTier();
  }, []);

  const isSubscribed = tier !== null;
  const tierBenefits = tier ? TIER_BENEFITS[tier] : null;

  return {
    tier,
    isSubscribed,
    bonusVotes: tierBenefits?.bonusVotes || 0,
    winChanceBoost: tierBenefits?.winChanceBoost || 0,
    hasAlgorithmicBoost: tierBenefits?.algorithmicBoost || false,
    loading,
    refetch: fetchTier,
  };
};

// Total votes = real votes only. TOP Premium provides ranking boost, NOT extra fake votes.
export const calculateTotalVotesWithBonus = (
  baseVotes: number,
  _tier: MegaTalentTier
): number => baseVotes;

// Ranking boost factor used for ordering submissions in leaderboards.
// Real vote counts displayed in UI are NOT affected.
export const getRankingBoostFactor = (tier: MegaTalentTier): number => {
  if (tier === 'top_premium') {
    return TOP_PREMIUM_BOOST_MULTIPLIER;
  }
  return 1.0;
};
