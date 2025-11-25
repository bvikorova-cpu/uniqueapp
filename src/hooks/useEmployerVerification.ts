import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useEmployerVerification() {
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setVerificationStatus(null);
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
        setVerificationStatus(null);
        setLoading(false);
        return;
      }

      // Check verification status
      const { data: verificationData, error: verificationError } = await supabase
        .from('employer_verifications')
        .select('verification_status')
        .eq('employer_id', user.id)
        .maybeSingle();

      if (verificationError && verificationError.code !== 'PGRST116') {
        throw verificationError;
      }

      setVerificationStatus(verificationData?.verification_status || null);
      setLoading(false);
    } catch (err) {
      console.error('Error checking verification status:', err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setVerificationStatus(null);
      setLoading(false);
    }
  };

  return { 
    verificationStatus, 
    isApproved: verificationStatus === 'approved',
    loading, 
    error, 
    refresh: checkVerificationStatus 
  };
}
