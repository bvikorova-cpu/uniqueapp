import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function usePurchaseVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      verifyPurchase(sessionId);
    }
  }, [searchParams]);

  const verifyPurchase = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-tip-purchase', {
        body: { sessionId },
      });

      if (error) throw error;

      toast({
        title: "Purchase Successful!",
        description: "Your tip has been unlocked. Check 'My Purchased Tips'.",
      });

      // Redirect to purchased tips page
      setTimeout(() => {
        navigate('/my-purchased-tips');
      }, 2000);
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify purchase",
        variant: "destructive",
      });
    }
  };
}
