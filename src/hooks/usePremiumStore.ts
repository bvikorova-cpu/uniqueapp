import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAICredits } from './useAICredits';
import type { Json } from '@/integrations/supabase/types';

interface PremiumFeature {
  id: string;
  feature_name: string;
  feature_type: string;
  credit_cost: number;
  description: string;
  icon: string;
  is_active: boolean;
}

interface PremiumBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  credit_cost: number;
  rarity: string;
  is_active: boolean;
}

interface PremiumTheme {
  id: string;
  name: string;
  description: string;
  preview_image: string | null;
  theme_data: Json | null;
  credit_cost: number;
  is_active: boolean;
}

interface PremiumAvatar {
  id: string;
  name: string;
  description: string;
  avatar_url: string;
  is_animated: boolean;
  credit_cost: number;
  rarity: string;
  is_active: boolean;
}

interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  is_equipped: boolean;
}

interface UserTheme {
  id: string;
  user_id: string;
  theme_id: string;
  is_active: boolean;
}

interface UserAvatar {
  id: string;
  user_id: string;
  avatar_id: string;
  is_equipped: boolean;
}

export const usePremiumStore = () => {
  const [features, setFeatures] = useState<PremiumFeature[]>([]);
  const [badges, setBadges] = useState<PremiumBadge[]>([]);
  const [themes, setThemes] = useState<PremiumTheme[]>([]);
  const [avatars, setAvatars] = useState<PremiumAvatar[]>([]);
  
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [userThemes, setUserThemes] = useState<UserTheme[]>([]);
  const [userAvatars, setUserAvatars] = useState<UserAvatar[]>([]);
  
  const [loading, setLoading] = useState(true);
  const { spendCredit, refresh: refreshCredits } = useAICredits();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Load all premium items
      const [featuresData, badgesData, themesData, avatarsData] = await Promise.all([
        supabase.from('premium_features').select('*').eq('is_active', true),
        supabase.from('premium_badges').select('*').eq('is_active', true),
        supabase.from('premium_themes').select('*').eq('is_active', true),
        supabase.from('premium_avatars').select('*').eq('is_active', true),
      ]);

      if (featuresData.data) setFeatures(featuresData.data);
      if (badgesData.data) setBadges(badgesData.data);
      if (themesData.data) setThemes(themesData.data);
      if (avatarsData.data) setAvatars(avatarsData.data);

      // Load user's owned items if logged in
      if (user) {
        const [userBadgesData, userThemesData, userAvatarsData] = await Promise.all([
          supabase.from('user_premium_badges').select('*').eq('user_id', user.id),
          supabase.from('user_premium_themes').select('*').eq('user_id', user.id),
          supabase.from('user_premium_avatars').select('*').eq('user_id', user.id),
        ]);

        if (userBadgesData.data) setUserBadges(userBadgesData.data);
        if (userThemesData.data) setUserThemes(userThemesData.data);
        if (userAvatarsData.data) setUserAvatars(userAvatarsData.data);
      }
    } catch (error) {
      console.error('Load premium data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseFeature = async (featureId: string, featureName: string, cost: number): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Kontrola admin statusu
      const { data: adminRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      // Admin does not have to pay
      if (!adminRole) {
        // Deduct credits
        const success = await spendCredit('custom_generation', `Purchased ${featureName}`);
        if (!success) return false;
      }

      // Record purchase
      const { error } = await supabase
        .from('user_premium_purchases')
        .insert({
          user_id: user.id,
          feature_id: featureId,
          feature_name: featureName,
          credits_spent: cost,
        });

      if (error) throw error;

      await refreshCredits();
      return true;
    } catch (error) {
      console.error('Purchase feature error:', error);
      return false;
    }
  };

  const purchaseBadge = async (badgeId: string, cost: number): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Check if already owned
      if (userBadges.some(ub => ub.badge_id === badgeId)) {
        return false;
      }

      // Kontrola admin statusu
      const { data: adminRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      // Admin does not have to pay
      if (!adminRole) {
        // Deduct credits (using the actual cost multiple times)
        for (let i = 0; i < cost; i++) {
          const success = await spendCredit('custom_generation', 'Premium badge purchase');
          if (!success) return false;
        }
      }

      // Add badge to user
      const { data, error } = await supabase
        .from('user_premium_badges')
        .insert({
          user_id: user.id,
          badge_id: badgeId,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) setUserBadges([...userBadges, data]);

      await refreshCredits();
      return true;
    } catch (error) {
      console.error('Purchase badge error:', error);
      return false;
    }
  };

  const purchaseTheme = async (themeId: string, cost: number): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Check if already owned
      if (userThemes.some(ut => ut.theme_id === themeId)) {
        return false;
      }

      // Kontrola admin statusu
      const { data: adminRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      // Admin does not have to pay
      if (!adminRole) {
        // Deduct credits
        for (let i = 0; i < cost; i++) {
          const success = await spendCredit('custom_generation', 'Premium theme purchase');
          if (!success) return false;
        }
      }

      // Add theme to user
      const { data, error } = await supabase
        .from('user_premium_themes')
        .insert({
          user_id: user.id,
          theme_id: themeId,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) setUserThemes([...userThemes, data]);

      await refreshCredits();
      return true;
    } catch (error) {
      console.error('Purchase theme error:', error);
      return false;
    }
  };

  const purchaseAvatar = async (avatarId: string, cost: number): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Check if already owned
      if (userAvatars.some(ua => ua.avatar_id === avatarId)) {
        return false;
      }

      // Kontrola admin statusu
      const { data: adminRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      // Admin does not have to pay
      if (!adminRole) {
        // Deduct credits
        for (let i = 0; i < cost; i++) {
          const success = await spendCredit('custom_generation', 'Premium avatar purchase');
          if (!success) return false;
        }
      }

      // Add avatar to user
      const { data, error } = await supabase
        .from('user_premium_avatars')
        .insert({
          user_id: user.id,
          avatar_id: avatarId,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) setUserAvatars([...userAvatars, data]);

      await refreshCredits();
      return true;
    } catch (error) {
      console.error('Purchase avatar error:', error);
      return false;
    }
  };

  const activateTheme = async (themeId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Call the database function to activate theme
      const { error } = await supabase.rpc('activate_user_theme', {
        p_user_id: user.id,
        p_theme_id: themeId,
      });

      if (error) throw error;

      // Reload user themes to get updated is_active status
      await loadData();

      // Apply theme colors to document
      const theme = themes.find(t => t.id === themeId);
      if (theme?.theme_data && typeof theme.theme_data === 'object' && !Array.isArray(theme.theme_data)) {
        const root = document.documentElement;
        const themeData = theme.theme_data as Record<string, string>;
        if (themeData.primary) root.style.setProperty('--primary', themeData.primary);
        if (themeData.background) root.style.setProperty('--background', themeData.background);
        if (themeData.foreground) root.style.setProperty('--foreground', themeData.foreground);
      }

      return true;
    } catch (error) {
      console.error('Activate theme error:', error);
      return false;
    }
  };

  return {
    features,
    badges,
    themes,
    avatars,
    userBadges,
    userThemes,
    userAvatars,
    loading,
    purchaseFeature,
    purchaseBadge,
    purchaseTheme,
    purchaseAvatar,
    activateTheme,
    refresh: loadData,
  };
};
