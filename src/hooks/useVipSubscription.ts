import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useIsAdmin } from './useIsAdmin';

interface VipSubscriptionStatus {
  is_vip: boolean;
  subscription_end?: string;
  loading: boolean;
}

export function useVipSubscription() {
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [status, setStatus] = useState<VipSubscriptionStatus>({
    is_vip: false,
    loading: true,
  });

  const checkVipStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatus({ is_vip: false, loading: false });
        return;
      }

      // Admin always has VIP access
      if (isAdmin) {
        setStatus({
          is_vip: true,
          subscription_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          loading: false,
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-vip-subscription');
      
      if (error) throw error;

      setStatus({
        is_vip: data.is_vip || false,
        subscription_end: data.subscription_end,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking VIP status:', error);
      setStatus({ is_vip: false, loading: false });
    }
  };

  const upgradeToVip = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-vip-checkout');
      
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating VIP checkout:', error);
      toast.error('Error creating payment');
    }
  };

  useEffect(() => {
    if (!adminLoading) {
      checkVipStatus();
    }
  }, [isAdmin, adminLoading]);

  useEffect(() => {
    if (adminLoading) return;
    
    // Refresh every minute
    const interval = setInterval(checkVipStatus, 60000);
    return () => clearInterval(interval);
  }, [adminLoading]);

  return {
    ...status,
    refreshStatus: checkVipStatus,
    upgradeToVip,
  };
}
