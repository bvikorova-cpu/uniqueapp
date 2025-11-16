import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function usePropertyExpiration() {
  useEffect(() => {
    // Check for expired listings every 5 minutes
    const checkExpired = async () => {
      try {
        await supabase.functions.invoke('check-expired-listings');
      } catch (error) {
        console.error('Error checking expired listings:', error);
      }
    };

    // Initial check
    checkExpired();

    // Set up interval
    const interval = setInterval(checkExpired, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);
}
