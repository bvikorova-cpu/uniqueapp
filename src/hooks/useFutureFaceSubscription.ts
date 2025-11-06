import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FutureFaceSubscription {
  hasBasic: boolean;
  hasPremium: boolean;
  hasFamily: boolean;
  hasCorporate: boolean;
  loading: boolean;
  familyMembersCount: number;
  familyMembersLimit: number;
}

export const useFutureFaceSubscription = () => {
  const [subscription, setSubscription] = useState<FutureFaceSubscription>({
    hasBasic: false,
    hasPremium: false,
    hasFamily: false,
    hasCorporate: false,
    loading: true,
    familyMembersCount: 0,
    familyMembersLimit: 5
  });

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSubscription(prev => ({ ...prev, loading: false }));
        return;
      }

      // Check for one-time purchases in Stripe or local storage
      const basicPurchased = localStorage.getItem(`future_face_basic_${user.id}`) === 'true';
      const premiumPurchased = localStorage.getItem(`future_face_premium_${user.id}`) === 'true';

      // Check for active subscriptions (Family or Corporate)
      // In a real implementation, this would check Stripe subscriptions
      const familyActive = localStorage.getItem(`future_face_family_${user.id}`) === 'active';
      const corporateActive = localStorage.getItem(`future_face_corporate_${user.id}`) === 'active';

      // Get family members count
      const { count } = await supabase
        .from('future_face_progressions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setSubscription({
        hasBasic: basicPurchased,
        hasPremium: premiumPurchased,
        hasFamily: familyActive,
        hasCorporate: corporateActive,
        loading: false,
        familyMembersCount: count || 0,
        familyMembersLimit: 5
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscription(prev => ({ ...prev, loading: false }));
    }
  };

  const createCheckout = async (priceId: string, planType: 'basic' | 'premium' | 'family' | 'corporate') => {
    try {
      const { data, error } = await supabase.functions.invoke('create-future-face-checkout', {
        body: { priceId, planType }
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      throw error;
    }
  };

  useEffect(() => {
    checkSubscription();

    // Refresh every minute
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, []);

  return {
    ...subscription,
    refresh: checkSubscription,
    createCheckout
  };
};
