import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PhobiaStatus {
  subscribed: boolean;
  subscription_end: string | null;
  credits_remaining: number;
  total_credits_purchased: number;
}

export function usePhobiaCredits() {
  const { toast } = useToast();
  const [status, setStatus] = useState<PhobiaStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setIsLoading(false); return; }

      const { data, error } = await supabase.functions.invoke("check-phobia-subscription");
      if (error) throw error;
      setStatus(data);
    } catch (err) {
      console.error("Error checking phobia status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Credits-only: Phobia Trading runs on the unified AI credits wallet.
  const purchaseCredits = async (_credits?: number) => {
    window.location.href = "/ai-credits";
  };

  const purchaseSubscription = async () => {
    window.location.href = "/ai-credits";
  };


  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return { status, isLoading, purchaseCredits, purchaseSubscription, refresh: checkStatus };
}
