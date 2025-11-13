import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReadingSubscription {
  subscribed: boolean;
  product_id: string | null;
  subscription_end: string | null;
  analyses_used: number;
  analyses_limit: number;
  quizzes_used: number;
  quizzes_limit: number;
  loading: boolean;
}

export const useKidsReadingSubscription = () => {
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<ReadingSubscription>({
    subscribed: false,
    product_id: null,
    subscription_end: null,
    analyses_used: 0,
    analyses_limit: 10,
    quizzes_used: 0,
    quizzes_limit: 10,
    loading: true,
  });

  const checkSubscription = async () => {
    try {
      setSubscription(prev => ({ ...prev, loading: true }));
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setSubscription({
          subscribed: false,
          product_id: null,
          subscription_end: null,
          analyses_used: 0,
          analyses_limit: 0,
          quizzes_used: 0,
          quizzes_limit: 0,
          loading: false,
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-kids-reading-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setSubscription({
        subscribed: data.subscribed || false,
        product_id: data.product_id || null,
        subscription_end: data.subscription_end || null,
        analyses_used: data.analyses_used || 0,
        analyses_limit: data.analyses_limit || 10,
        quizzes_used: data.quizzes_used || 0,
        quizzes_limit: data.quizzes_limit || 10,
        loading: false,
      });
    } catch (error: any) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to check subscription status",
        variant: "destructive",
      });
      setSubscription(prev => ({ ...prev, loading: false }));
    }
  };

  const createCheckout = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to subscribe",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-kids-reading-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Redirecting to checkout",
          description: "Opening Stripe checkout in a new tab...",
        });
      }
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive",
      });
    }
  };

  const incrementAnalysisUsage = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('kids_reading_usage')
        .update({ 
          analyses_used: subscription.analyses_used + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user.id);

      if (error) throw error;

      setSubscription(prev => ({
        ...prev,
        analyses_used: prev.analyses_used + 1
      }));
    } catch (error: any) {
      console.error('Error incrementing analysis usage:', error);
    }
  };

  const incrementQuizUsage = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('kids_reading_usage')
        .update({ 
          quizzes_used: subscription.quizzes_used + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user.id);

      if (error) throw error;

      setSubscription(prev => ({
        ...prev,
        quizzes_used: prev.quizzes_used + 1
      }));
    } catch (error: any) {
      console.error('Error incrementing quiz usage:', error);
    }
  };

  useEffect(() => {
    checkSubscription();
    
    // Auto-refresh every minute
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, []);

  return {
    subscription,
    refresh: checkSubscription,
    createCheckout,
    incrementAnalysisUsage,
    incrementQuizUsage,
  };
};
