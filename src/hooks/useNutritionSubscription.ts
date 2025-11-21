import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface NutritionSubscription {
  subscription_type: string;
  status: string;
  meal_plans_limit: number | null;
  food_scans_limit: number | null;
  features: any;
  current_period_end: string;
}

export function useNutritionSubscription() {
  const [subscription, setSubscription] = useState<NutritionSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSubscription(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('nutrition_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // If no subscription, create premium tier with inactive status
      if (!data) {
        const { data: newSub, error: createError } = await supabase
          .from('nutrition_subscriptions')
          .insert({
            user_id: user.id,
            subscription_type: 'premium',
            status: 'inactive',
            meal_plans_limit: 0,
            food_scans_limit: 0,
            features: {},
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          })
          .select()
          .single();

        if (createError) throw createError;
        setSubscription(newSub);
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const upgrade = async (newTier: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const features: Record<string, any> = {};
      let meal_plans_limit = null;
      let food_scans_limit = null;

      // Set limits based on tier
      switch (newTier) {
        case 'premium':
          meal_plans_limit = null; // unlimited
          food_scans_limit = null;
          features.macro_optimization = true;
          features.shopping_lists = true;
          break;
        case 'pro':
          meal_plans_limit = null;
          food_scans_limit = null;
          features.macro_optimization = true;
          features.shopping_lists = true;
          features.family_mode = true;
          features.allergen_tracking = true;
          features.diet_preferences = true;
          break;
        case 'starter':
          food_scans_limit = 50;
          features.scan_history = true;
          break;
        case 'athlete':
          features.ai_coach = true;
          features.macro_adjustments = true;
          features.progress_analytics = true;
          break;
        // Add more tiers as needed
      }

      const { data, error } = await supabase
        .from('nutrition_subscriptions')
        .update({
          subscription_type: newTier,
          meal_plans_limit,
          food_scans_limit,
          features,
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setSubscription(data);
      return data;
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      throw error;
    }
  };

  return {
    subscription,
    loading,
    refresh: loadSubscription,
    upgrade
  };
}
