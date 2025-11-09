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

      // Check payment via Stripe
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        'check-employer-payment'
      );

      if (paymentError) throw paymentError;

      setHasPaid(paymentData?.hasPaid || false);
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
