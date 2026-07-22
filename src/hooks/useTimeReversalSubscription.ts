import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TimeReversalSubscription {
  subscribed: boolean;
  activeFeatures: string[];
  subscription_end: string | null;
  loading: boolean;
}

export const useTimeReversalSubscription = () => { const [subscription, setSubscription] = useState<TimeReversalSubscription>({
    subscribed: false,
    activeFeatures: [],
    subscription_end: null,
    loading: true });

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setSubscription({
          subscribed: false,
          activeFeatures: [],
          subscription_end: null,
          loading: false });
        return;
      }

      const { data, error } = await supabase.functions.invoke("check-time-reversal-subscription");

      if (error) throw error;

      setSubscription({ subscribed: data.subscribed || false,
        activeFeatures: data.activeFeatures || [],
        subscription_end: data.subscription_end || null,
        loading: false });
    } catch (error) { console.error("Error checking Time Reversal subscription:", error);
      setSubscription({
        subscribed: false,
        activeFeatures: [],
        subscription_end: null,
        loading: false });
    }
  };

  useEffect(() => {
    checkSubscription();

    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, []);

  const hasFeature = (productId: string) => {
    return subscription.activeFeatures.includes(productId);
  };

  return { ...subscription,
    refresh: checkSubscription,
    hasFeature };
};
