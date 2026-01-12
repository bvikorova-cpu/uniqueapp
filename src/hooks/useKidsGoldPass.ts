import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface GoldPassStatus {
  hasGoldPass: boolean;
  loading: boolean;
  expiresAt: string | null;
}

export function useKidsGoldPass(): GoldPassStatus {
  const [status, setStatus] = useState<GoldPassStatus>({
    hasGoldPass: false,
    loading: true,
    expiresAt: null,
  });

  useEffect(() => {
    checkGoldPassStatus();
  }, []);

  const checkGoldPassStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatus({ hasGoldPass: false, loading: false, expiresAt: null });
        return;
      }

      // Check for Gold Pass subscription
      const { data, error } = await supabase.functions.invoke('check-kids-subscription', {
        body: { checkGoldPass: true }
      });

      if (error) {
        console.error('Error checking Gold Pass:', error);
        setStatus({ hasGoldPass: false, loading: false, expiresAt: null });
        return;
      }

      // Check if user has Gold Pass (product_id matches gold pass)
      const isGoldPass = data?.subscribed && data?.tier === 'gold_pass';
      
      setStatus({
        hasGoldPass: isGoldPass,
        loading: false,
        expiresAt: data?.current_period_end || null,
      });
    } catch (error) {
      console.error('Error in checkGoldPassStatus:', error);
      setStatus({ hasGoldPass: false, loading: false, expiresAt: null });
    }
  };

  return status;
}
