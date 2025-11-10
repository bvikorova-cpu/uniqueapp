import { useHealthcareSubscription } from './useHealthcareSubscription';

export interface HealthcareSubscriptionLimits {
  name: string;
  maxCollections: number;
  maxPagesPerCollection: number;
  canAccessLibrary: boolean;
  libraryAccessLevel: 'free' | 'basic' | 'professional';
}

const HEALTHCARE_LIMITS: Record<string, HealthcareSubscriptionLimits> = {
  free: {
    name: 'Free',
    maxCollections: 0,
    maxPagesPerCollection: 0,
    canAccessLibrary: false,
    libraryAccessLevel: 'free',
  },
  basic: {
    name: 'Basic',
    maxCollections: 5,
    maxPagesPerCollection: 20,
    canAccessLibrary: true,
    libraryAccessLevel: 'basic',
  },
  professional: {
    name: 'Professional',
    maxCollections: 999,
    maxPagesPerCollection: 999,
    canAccessLibrary: true,
    libraryAccessLevel: 'professional',
  },
};

export const useHealthcareSubscriptionLimits = () => {
  const { subscription_tier, subscribed } = useHealthcareSubscription();

  const limits = HEALTHCARE_LIMITS[subscription_tier || 'free'] || HEALTHCARE_LIMITS.free;

  return {
    limits,
    isSubscribed: subscribed,
  };
};
