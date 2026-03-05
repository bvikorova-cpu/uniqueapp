import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { safeInvoke } from "@/utils/safeInvoke";

interface HomeworkUsage {
  questionsUsed: number;
  questionsLimit: number;
  isPremium: boolean;
  loading: boolean;
}

export const useKidsHomework = () => {
  const { user } = useAuth();
  const [usage, setUsage] = useState<HomeworkUsage>({
    questionsUsed: 0,
    questionsLimit: 1,
    isPremium: false,
    loading: true,
  });

  useEffect(() => {
    if (user) {
      checkUsage();
    } else {
      setUsage({
        questionsUsed: 0,
        questionsLimit: 1,
        isPremium: false,
        loading: false,
      });
    }
  }, [user]);

  const checkUsage = async () => {
    try {
      // Check subscription status
      const { data: subData } = await safeInvoke('check-kids-subscription');
      const isPremium = subData?.subscribed || false;

      if (isPremium) {
        setUsage({
          questionsUsed: 0,
          questionsLimit: -1, // -1 means unlimited
          isPremium: true,
          loading: false,
        });
        return;
      }

      // Check daily usage for free users
      const today = new Date().toISOString().split('T')[0];
      const { data: usageData, error } = await supabase
        .from('kids_homework_usage')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching usage:', error);
      }

      const questionsUsed = usageData?.last_reset_date === today 
        ? usageData.questions_asked_today 
        : 0;

      setUsage({
        questionsUsed,
        questionsLimit: 1,
        isPremium: false,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking usage:', error);
      setUsage({
        questionsUsed: 0,
        questionsLimit: 1,
        isPremium: false,
        loading: false,
      });
    }
  };

  const refreshUsage = () => {
    if (user) {
      checkUsage();
    }
  };

  const manageSubscription = async () => {
    try {
      const { data, error } = await safeInvoke('kids-customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Error opening customer portal:', err);
      toast.error("Failed to open subscription management portal");
    }
  };

  return {
    ...usage,
    refreshUsage,
    manageSubscription,
  };
};