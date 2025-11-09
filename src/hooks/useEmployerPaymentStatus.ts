import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useEmployerPaymentStatus() {
  const [hasPaid, setHasPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHasPaid(false);
        setLoading(false);
        return;
      }

      // Check if user is employer
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'employer')
        .maybeSingle();

      if (!roleData) {
        setHasPaid(false);
        setLoading(false);
        return;
      }

      // Check if employer has any paid (active) job listings
      const { data: jobsData, error: jobsError } = await supabase
        .from('job_listings')
        .select('id, is_active')
        .eq('employer_id', user.id)
        .eq('is_active', true)
        .limit(1);

      if (jobsError) throw jobsError;

      const hasPaidStatus = jobsData && jobsData.length > 0;
      setHasPaid(hasPaidStatus);
      setLoading(false);
    } catch (err: any) {
      console.error('Error checking payment status:', err);
      setError(err.message);
      setHasPaid(false);
      setLoading(false);
    }
  };

  return { hasPaid, loading, error, refresh: checkPaymentStatus };
}
