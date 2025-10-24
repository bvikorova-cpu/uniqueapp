import { useState, useEffect } from "react";

export interface KidsSubscription {
  subscription_type: string;
  status: string;
  stories_limit: number | null;
  features: {
    hd_illustrations?: boolean;
    audio?: boolean;
    video?: boolean;
    ar?: boolean;
    child_profiles?: number;
    analytics?: boolean;
    custom_branding?: boolean;
  };
  current_period_end: string;
}

// Simple localStorage-based subscription management for demo
export function useKidsSubscription() {
  const [subscription, setSubscription] = useState<KidsSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = () => {
    try {
      const stored = localStorage.getItem('kids_subscription');
      if (stored) {
        setSubscription(JSON.parse(stored));
      } else {
        // Default to free tier
        const freeTier: KidsSubscription = {
          subscription_type: 'free',
          status: 'active',
          stories_limit: 3,
          features: {},
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        setSubscription(freeTier);
        localStorage.setItem('kids_subscription', JSON.stringify(freeTier));
      }
    } catch (error) {
      console.error('Error loading kids subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const upgrade = async (newTier: string) => {
    try {
      const features: Record<string, any> = {};
      let stories_limit = null;

      // Set limits based on tier
      switch (newTier) {
        case 'free':
          stories_limit = 3;
          break;
        case 'basic':
          stories_limit = 20;
          features.hd_illustrations = true;
          features.audio = true;
          break;
        case 'family':
          stories_limit = null; // unlimited
          features.hd_illustrations = true;
          features.audio = true;
          features.video = true;
          features.ar = true;
          features.child_profiles = 3;
          break;
        case 'school':
          stories_limit = null;
          features.hd_illustrations = true;
          features.audio = true;
          features.video = true;
          features.ar = true;
          features.child_profiles = 50;
          features.analytics = true;
          features.custom_branding = true;
          break;
      }

      const updatedSub: KidsSubscription = {
        subscription_type: newTier,
        status: 'active',
        stories_limit,
        features,
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      setSubscription(updatedSub);
      localStorage.setItem('kids_subscription', JSON.stringify(updatedSub));
      return updatedSub;
    } catch (error) {
      console.error('Error upgrading kids subscription:', error);
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
