import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SkillSwapSubscription {
  hasSubscription: boolean;
  subscriptionEnd?: string;
  loading: boolean;
}

export const useSkillSwap = () => {
  const [subscription, setSubscription] = useState<SkillSwapSubscription>({
    hasSubscription: false,
    loading: true,
  });

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setSubscription({
          hasSubscription: false,
          loading: false,
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-skill-swap-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // check-subscription edge function vracia { subscribed, subscription_end, ... }
      // Akceptujeme aj legacy { hasSubscription, subscriptionEnd } pre forward-compat.
      setSubscription({
        hasSubscription: Boolean(data?.subscribed ?? data?.hasSubscription),
        subscriptionEnd: data?.subscription_end ?? data?.subscriptionEnd,
        loading: false,
      });
    } catch (error: any) {
      console.error('Subscription check error:', error);
      setSubscription(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    checkSubscription();

    const interval = setInterval(checkSubscription, 60000);

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(() => {
      checkSubscription();
    });

    return () => {
      clearInterval(interval);
      authSubscription.unsubscribe();
    };
  }, []);

  const createCheckout = async (): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to subscribe");
        return null;
      }

      const { data, error } = await supabase.functions.invoke('create-skill-swap-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      return data?.url || null;
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error("Failed to create checkout session");
      return null;
    }
  };

  return {
    subscription,
    loading: subscription.loading,
    createCheckout,
    checkSubscription,
  };
};