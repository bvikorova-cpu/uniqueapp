import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useEmployerPaymentStatus() {
  const [subscribed, setSubscribed] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSubscribed(false);
        setProductId(null);
        setSubscriptionEnd(null);
        setLoading(false);
        return;
      }

      // Check subscription via Stripe
      const { data: subscriptionData, error: subscriptionError } = await supabase.functions.invoke(
        'check-employer-subscription'
      );

      if (subscriptionError) throw subscriptionError;

      setSubscribed(subscriptionData?.subscribed || false);
      setProductId(subscriptionData?.product_id || null);
      setSubscriptionEnd(subscriptionData?.subscription_end || null);
      setLoading(false);
    } catch (err) {
      console.error('Error checking subscription status:', err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setSubscribed(false);
      setProductId(null);
      setSubscriptionEnd(null);
      setLoading(false);
    }
  };

  const createCheckout = async (priceId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-employer-subscription-checkout', {
        body: { priceId }
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

  const manageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('employer-customer-portal');

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      throw error;
    }
  };

  return {
    subscribed,
    productId,
    subscriptionEnd,
    loading,
    error,
    refresh: checkPaymentStatus,
    createCheckout,
    manageSubscription
  };
}
