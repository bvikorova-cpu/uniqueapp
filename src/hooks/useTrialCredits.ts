import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const TRIAL_CREDITS_KEY = 'trial_credits';
const INITIAL_TRIAL_CREDITS = 5; // 5 free trials per feature

export interface TrialCredits {
  fashion: number;
  nutrition: number;
}

export const useTrialCredits = () => {
  const [credits, setCredits] = useState<TrialCredits>(() => {
    const stored = localStorage.getItem(TRIAL_CREDITS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      fashion: INITIAL_TRIAL_CREDITS,
      nutrition: INITIAL_TRIAL_CREDITS,
    };
  });

  useEffect(() => {
    localStorage.setItem(TRIAL_CREDITS_KEY, JSON.stringify(credits));
  }, [credits]);

  const useCredit = (type: 'fashion' | 'nutrition'): boolean => {
    if (credits[type] <= 0) {
      toast.error(
        `No trial credits left for ${type === 'fashion' ? 'Fashion Studio' : 'Nutrition Hub'}. Please upgrade to continue.`,
        { duration: 5000 }
      );
      return false;
    }

    setCredits(prev => ({
      ...prev,
      [type]: prev[type] - 1,
    }));

    toast.success(`Trial credit used. ${credits[type] - 1} remaining for this feature.`);
    return true;
  };

  const hasCredits = (type: 'fashion' | 'nutrition'): boolean => {
    return credits[type] > 0;
  };

  return {
    credits,
    useCredit,
    hasCredits,
  };
};
