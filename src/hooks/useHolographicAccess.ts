import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useHolographicAccess(serviceType: string) {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchase, setPurchase] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkAccess();
  }, [serviceType]);

  const checkAccess = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-holographic-access', {
        body: { serviceType }
      });

      if (error) throw error;

      setHasAccess(data.hasAccess || false);
      setPurchase(data.purchase || null);
    } catch (error) {
      console.error('Error checking holographic access:', error);
      toast({
        title: "Error",
        description: "Failed to verify access. Please try again.",
        variant: "destructive",
      });
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  return { hasAccess, loading, purchase, refresh: checkAccess };
}
