import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useTimeCapsuleAccess() {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [hasPremium, setHasPremium] = useState(false);
  const [canCreateCapsules, setCanCreateCapsules] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-time-capsule-access');

      if (error) throw error;

      setHasAccess(data.hasAccess || false);
      setPurchases(data.purchases || []);
      setHasPremium(data.hasPremium || false);
      setCanCreateCapsules(data.canCreateCapsules || false);
    } catch (error) {
      console.error('Error checking time capsule access:', error);
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

  return { 
    hasAccess, 
    loading, 
    purchases, 
    hasPremium, 
    canCreateCapsules, 
    refresh: checkAccess 
  };
}
