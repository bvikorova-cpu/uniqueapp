import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PsychologySubscription {
  subscribed: boolean;
  freeMessagesUsed: number;
  freeMessagesLimit: number;
  loading: boolean;
}

export function usePsychologySubscription() {
  const [subscription, setSubscription] = useState<PsychologySubscription>({
    subscribed: false,
    freeMessagesUsed: 0,
    freeMessagesLimit: 5,
    loading: true,
  });

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSubscription(prev => ({ ...prev, loading: false }));
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-psychology-subscription');

      if (error) throw error;

      setSubscription({
        subscribed: data?.subscribed || false,
        freeMessagesUsed: data?.free_messages_used || 0,
        freeMessagesLimit: 5,
        loading: false,
      });
    } catch (err: any) {
      console.error('Error checking subscription:', err);
      setSubscription(prev => ({ ...prev, loading: false }));
    }
  };

  const createCheckout = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-psychology-checkout');

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      throw error;
    }
  };

  const manageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('psychology-customer-portal');

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      throw error;
    }
  };

  useEffect(() => {
    checkSubscription();
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, []);

  return {
    subscription,
    refresh: checkSubscription,
    createCheckout,
    manageSubscription,
  };
}
