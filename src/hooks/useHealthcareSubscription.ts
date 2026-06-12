import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_status: string | null;
  subscription_end: string | null;
  loading: boolean;
}

export const useHealthcareSubscription = () => {
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    subscription_tier: null,
    subscription_status: null,
    subscription_end: null,
    loading: true,
  });
  const { toast } = useToast();

  const checkSubscription = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true }));
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatus({
          subscribed: false,
          subscription_tier: null,
          subscription_status: null,
          subscription_end: null,
          loading: false,
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-healthcare-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        setStatus(prev => ({ ...prev, loading: false }));
        return;
      }

      setStatus({
        subscribed: data.subscribed,
        subscription_tier: data.subscription_tier,
        subscription_status: data.subscription_status,
        subscription_end: data.subscription_end,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to manage your subscription",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('healthcare-customer-portal');
      
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open customer portal",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkSubscription();

    const { data: authSub } = supabase.auth.onAuthStateChange((_event, _session) => {
      checkSubscription();
    });

    const interval = setInterval(() => {
      checkSubscription();
    }, 60000);

    return () => {
      clearInterval(interval);
      authSub.subscription.unsubscribe();
    };
  }, []);

  return {
    ...status,
    checkSubscription,
    openCustomerPortal,
  };
};
