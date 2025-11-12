import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface StoryUsage {
  storiesCreatedThisMonth: number;
  isPremium: boolean;
  loading: boolean;
}

export const useKidsStoryCreator = () => {
  const { user } = useAuth();
  const [usage, setUsage] = useState<StoryUsage>({
    storiesCreatedThisMonth: 0,
    isPremium: false,
    loading: true,
  });

  useEffect(() => {
    if (user) {
      checkUsage();
    } else {
      setUsage({
        storiesCreatedThisMonth: 0,
        isPremium: false,
        loading: false,
      });
    }
  }, [user]);

  const checkUsage = async () => {
    try {
      // Check subscription status
      const { data: subData } = await supabase.functions.invoke('check-kids-story-subscription');
      const isPremium = subData?.subscribed || false;

      if (isPremium) {
        setUsage({
          storiesCreatedThisMonth: 0,
          isPremium: true,
          loading: false,
        });
        return;
      }

      // Check monthly usage for free users
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data: usageData, error } = await supabase
        .from('kids_story_usage')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching usage:', error);
      }

      const lastResetMonth = usageData?.last_reset_date?.slice(0, 7);
      const storiesCreated = lastResetMonth === currentMonth 
        ? usageData.stories_created_this_month 
        : 0;

      setUsage({
        storiesCreatedThisMonth: storiesCreated,
        isPremium: false,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking usage:', error);
      setUsage({
        storiesCreatedThisMonth: 0,
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
      const { data, error } = await supabase.functions.invoke('kids-story-customer-portal');
      
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
