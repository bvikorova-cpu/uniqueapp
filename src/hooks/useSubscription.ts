import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionLimits {
  tier: 'basic' | 'premium' | 'business';
  bazaarListingsPerMonth: number;
  auctionListingsPerMonth: number;
  commissionRate: number;
  aiGenerationsPerMonth: number;
  featuredListingsPerMonth: number;
  hasAnalytics: boolean;
}

const SUBSCRIPTION_LIMITS: Record<string, SubscriptionLimits> = {
  basic: {
    tier: 'basic',
    bazaarListingsPerMonth: 5,
    auctionListingsPerMonth: 5,
    commissionRate: 3,
    aiGenerationsPerMonth: 20, // Basic: 20 included monthly
    featuredListingsPerMonth: 1,
    hasAnalytics: false,
  },
  premium: {
    tier: 'premium',
    bazaarListingsPerMonth: -1, // unlimited
    auctionListingsPerMonth: -1, // unlimited
    commissionRate: 0,
    aiGenerationsPerMonth: 50,
    featuredListingsPerMonth: 3,
    hasAnalytics: true,
  },
  business: {
    tier: 'business',
    bazaarListingsPerMonth: -1,
    auctionListingsPerMonth: -1,
    commissionRate: 0,
    aiGenerationsPerMonth: -1,
    featuredListingsPerMonth: -1,
    hasAnalytics: true,
  },
};

export const useSubscription = () => {
  const [limits, setLimits] = useState<SubscriptionLimits>(SUBSCRIPTION_LIMITS.basic);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLimits(SUBSCRIPTION_LIMITS.basic);
        setLoading(false);
        return;
      }

      // Kontrola admin statusu
      const { data: adminRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (adminRole) {
        setLimits(SUBSCRIPTION_LIMITS.business);
        setLoading(false);
        return;
      }

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (sub && sub.tier in SUBSCRIPTION_LIMITS) {
        setLimits(SUBSCRIPTION_LIMITS[sub.tier]);
      } else {
        setLimits(SUBSCRIPTION_LIMITS.basic);
      }
    } catch (error) {
      console.error('Load subscription error:', error);
      setLimits(SUBSCRIPTION_LIMITS.basic);
    } finally {
      setLoading(false);
    }
  };

  const canCreateListing = async (type: 'bazaar' | 'auction'): Promise<boolean> => {
    const limit = type === 'bazaar' 
      ? limits.bazaarListingsPerMonth 
      : limits.auctionListingsPerMonth;

    if (limit === -1) return true; // unlimited

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const table = type === 'bazaar' ? 'bazaar_items' : 'auction_items';
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', monthStart.toISOString());

      return (count || 0) < limit;
    } catch (error) {
      console.error('Check listing limit error:', error);
      return false;
    }
  };

  const calculateCommission = (amount: number): number => {
    if (limits.commissionRate === 0) return 0;
    return (amount * limits.commissionRate) / 100;
  };

  return {
    limits,
    loading,
    canCreateListing,
    calculateCommission,
    refresh: loadSubscription,
  };
};
