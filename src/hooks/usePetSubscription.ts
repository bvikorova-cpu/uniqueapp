import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PetSubscription {
  subscribed: boolean;
  product_id: string | null;
  tier: string | null;
  subscription_end: string | null;
  max_pets: number;
  pets_tracked: number;
  loading: boolean;
}

export function usePetSubscription() {
  const [subscription, setSubscription] = useState<PetSubscription>({
    subscribed: false,
    product_id: null,
    tier: null,
    subscription_end: null,
    max_pets: 0,
    pets_tracked: 0,
    loading: true,
  });

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setSubscription({
          subscribed: false,
          product_id: null,
          tier: null,
          subscription_end: null,
          max_pets: 0,
          pets_tracked: 0,
          loading: false,
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        body: { tier: 'pet' },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setSubscription({
        subscribed: data.subscribed || false,
        product_id: data.product_id || null,
        tier: data.tier || null,
        subscription_end: data.subscription_end || null,
        max_pets: data.max_pets || 0,
        pets_tracked: data.pets_tracked || 0,
        loading: false,
      });
    } catch (error: any) {
      console.error('Subscription check error:', error);
      toast.error('Failed to check subscription status');
      setSubscription(prev => ({ ...prev, loading: false }));
    }
  };

  const createCheckout = async (priceId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please sign in to subscribe');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-pet-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { priceId },
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to create checkout session');
    }
  };

  useEffect(() => {
    checkSubscription();

    // Check subscription status every minute
    const interval = setInterval(checkSubscription, 60000);

    return () => clearInterval(interval);
  }, []);

  return {
    subscription,
    loading: subscription.loading,
    refresh: checkSubscription,
    createCheckout,
  };
}
