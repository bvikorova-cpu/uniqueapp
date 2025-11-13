import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ScienceSubscription {
  subscribed: boolean;
  product_id: string | null;
  subscription_end: string | null;
  experiments_used: number;
  experiments_limit: number;
  loading: boolean;
}

export const useScienceSubscription = () => {
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<ScienceSubscription>({
    subscribed: false,
    product_id: null,
    subscription_end: null,
    experiments_used: 0,
    experiments_limit: 1,
    loading: true,
  });

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setSubscription({
          subscribed: false,
          product_id: null,
          subscription_end: null,
          experiments_used: 0,
          experiments_limit: 1,
          loading: false,
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-science-subscription');

      if (error) throw error;

      setSubscription({
        subscribed: data.subscribed || false,
        product_id: data.product_id || null,
        subscription_end: data.subscription_end || null,
        experiments_used: data.experiments_used || 0,
        experiments_limit: data.experiments_limit || 1,
        loading: false,
      });
    } catch (error: any) {
      console.error('Error checking subscription:', error);
      setSubscription(prev => ({ ...prev, loading: false }));
    }
  };

  const subscribe = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to subscribe to Premium",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-science-checkout');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
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

  const manageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to open customer portal",
        variant: "destructive",
      });
    }
  };

  const incrementUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current usage
      const { data: currentData } = await supabase
        .from('kids_science_usage')
        .select('experiments_this_month')
        .eq('user_id', user.id)
        .single();

      // Increment usage
      await supabase
        .from('kids_science_usage')
        .update({ experiments_this_month: (currentData?.experiments_this_month || 0) + 1 })
        .eq('user_id', user.id);

      // Refresh subscription status
      await checkSubscription();
    } catch (error) {
      console.error('Error incrementing usage:', error);
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
    refreshSubscription: checkSubscription,
    subscribe,
    manageSubscription,
    incrementUsage,
  };
};