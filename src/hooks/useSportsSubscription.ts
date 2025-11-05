import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionStatus {
  subscribed: boolean;
  tier: 'ai_premium' | 'expert_tipster' | null;
  subscription_end: string | null;
  loading: boolean;
}

export function useSportsSubscription() {
  const { user, session } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    tier: null,
    subscription_end: null,
    loading: true,
  });

  const checkSubscription = async () => {
    if (!user || !session) {
      setStatus({
        subscribed: false,
        tier: null,
        subscription_end: null,
        loading: false,
      });
      return;
    }

    try {
      setStatus(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await supabase.functions.invoke('check-sports-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        setStatus({
          subscribed: false,
          tier: null,
          subscription_end: null,
          loading: false,
        });
        return;
      }

      setStatus({
        subscribed: data.subscribed || false,
        tier: data.tier || null,
        subscription_end: data.subscription_end || null,
        loading: false,
      });
    } catch (error) {
      console.error('Error:', error);
      setStatus({
        subscribed: false,
        tier: null,
        subscription_end: null,
        loading: false,
      });
    }
  };

  useEffect(() => {
    checkSubscription();
    
    // Refresh subscription every minute
    const interval = setInterval(checkSubscription, 60000);
    
    return () => clearInterval(interval);
  }, [user, session]);

  const createCheckout = async (tier: 'ai_premium' | 'expert_tipster') => {
    if (!session) {
      throw new Error('Must be logged in to subscribe');
    }

    const { data, error } = await supabase.functions.invoke('create-sports-checkout', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: { tier },
    });

    if (error) throw error;
    if (!data?.url) throw new Error('No checkout URL returned');

    // Open checkout in new tab
    window.open(data.url, '_blank');
  };

  return {
    ...status,
    checkSubscription,
    createCheckout,
  };
}
