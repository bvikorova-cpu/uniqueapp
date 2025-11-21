import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useShadowSubscription() {
  const { user } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSubscription = async () => {
    if (!user) {
      setSubscribed(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('check-shadow-subscription');
      
      if (error) throw error;
      
      setSubscribed(data.subscribed || false);
      setSubscriptionEnd(data.subscription_end || null);
    } catch (error) {
      console.error('Check subscription error:', error);
      setSubscribed(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();
    
    // Check every minute
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user]);

  return { subscribed, subscriptionEnd, loading, refresh: checkSubscription };
}
