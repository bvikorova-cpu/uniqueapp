import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useCrystalSubscription() {
  const { user } = useAuth();
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);

  const check = useCallback(async () => {
    if (!user) {
      setSubscribed(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        body: { tier: "crystal" },
      });
      if (error) throw error;
      setSubscribed(!!data?.subscribed);
      setSubscriptionEnd(data?.subscription_end ?? null);
    } catch (e) {
      console.error("[crystal sub] check failed", e);
      setSubscribed(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [check]);

  const startCheckout = useCallback(async () => {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { product: "crystal" },
    });
    if (error) throw error;
    if (data?.url) window.open(data.url, "_blank");
  }, []);

  return { subscribed, loading, subscriptionEnd, refresh: check, startCheckout };
}
