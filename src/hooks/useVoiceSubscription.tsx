import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface VoiceSubscription {
  hasVoiceLibrary: boolean;
  hasUnlimitedTTS: boolean;
  hasAIConversation: boolean;
  hasCloneSetup: boolean;
  subscriptionEnds?: {
    voiceLibrary?: string;
    unlimitedTTS?: string;
    aiConversation?: string;
  };
  loading: boolean;
}

export function useVoiceSubscription() {
  const [subscription, setSubscription] = useState<VoiceSubscription>({
    hasVoiceLibrary: false,
    hasUnlimitedTTS: false,
    hasAIConversation: false,
    hasCloneSetup: false,
    loading: true,
  });
  const { toast } = useToast();

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setSubscription({
          hasVoiceLibrary: false,
          hasUnlimitedTTS: false,
          hasAIConversation: false,
          hasCloneSetup: false,
          loading: false,
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-voice-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setSubscription({
        ...data,
        loading: false,
      });
    } catch (error: any) {
      console.error('Subscription check error:', error);
      toast({
        title: 'Error checking subscription',
        description: error.message,
        variant: 'destructive',
      });
      setSubscription(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    checkSubscription();

    // Check subscription status every minute
    const interval = setInterval(checkSubscription, 60000);

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(() => {
      checkSubscription();
    });

    return () => {
      clearInterval(interval);
      authSubscription.unsubscribe();
    };
  }, []);

  const openCustomerPortal = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to manage your subscription',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('voice-customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return {
    ...subscription,
    refresh: checkSubscription,
    openCustomerPortal,
  };
}
