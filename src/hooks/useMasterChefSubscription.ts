import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MasterChefSubscription {
  subscribed: boolean;
  tier: string | null;
  subscription_end: string | null;
  loading: boolean;
}

export const useMasterChefSubscription = () => { const [subscription, setSubscription] = useState<MasterChefSubscription>({
    subscribed: false,
    tier: null,
    subscription_end: null,
    loading: true });

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setSubscription({
          subscribed: false,
          tier: null,
          subscription_end: null,
          loading: false });
        return;
      }

      const { data, error } = await supabase.functions.invoke("check-masterchef-subscription");

      if (error) throw error;

      setSubscription({ subscribed: data.subscribed || false,
        tier: data.tier || null,
        subscription_end: data.subscription_end || null,
        loading: false });
    } catch (error) { console.error("Error checking MasterChef subscription:", error);
      setSubscription({
        subscribed: false,
        tier: null,
        subscription_end: null,
        loading: false });
    }
  };

  useEffect(() => {
    checkSubscription();

    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, []);

  return { ...subscription,
    refresh: checkSubscription };
};
