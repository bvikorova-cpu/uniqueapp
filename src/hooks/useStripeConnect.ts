import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useStripeConnect() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const startOnboarding = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-connect-account');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    const { data, error } = await supabase.functions.invoke('check-connect-status');
    if (error) throw error;
    return data;
  };

  const liveStatus = async () => {
    const { data, error } = await supabase.functions.invoke('check-connect-status', {
      body: { action: 'live_status' },
    });
    if (error) throw error;
    return data;
  };

  const openDashboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-connect-login-link');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return { startOnboarding, checkStatus, openDashboard, loading };
}
