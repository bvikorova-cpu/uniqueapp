// MasterChef Product Mappings
// IMPORTANT: Replace these product IDs with your actual Stripe product IDs

export const MASTERCHEF_TIERS = {
  AMATEUR: {
    id: 'prod_TMRTqaG6dcQNVx',
    name: 'Amateur',
    price: '€19.99',
    priceId: 'price_1SPiaUGaXSfGtYFtpV3Q8jjN',
    features: [
      '5 competitions per month',
      'Basic voting system',
      'Access to amateur categories',
      'Community recipes',
      'Basic performance statistics'
    ],
    description: 'For beginners and enthusiasts'
  },
  PRO: {
    id: 'prod_TMRTnRIoFKo2US',
    name: 'Pro',
    price: '€49.99',
    priceId: 'price_1SPiarGaXSfGtYFtBgTuCPiw',
    features: [
      'Unlimited competitions',
      'Live battles in real-time',
      'Premium categories (Fine Dining, Dessert Masters)',
      'Exclusive recipes from professionals',
      'Detailed statistics and analytics',
      'Priority support',
      'Mystery Box challenges'
    ],
    description: 'For serious chefs',
    popular: true
  },
  ELITE: {
    id: 'prod_TMRUCoB3rBTawE',
    name: 'Elite',
    price: '€99.99',
    priceId: 'price_1SPibC0QTWhd4oRpJwaH5vZM',
    features: [
      'Everything from Pro tier',
      'Personal mentoring from professional chefs',
      'VIP behind-the-scenes access',
      'Winning bonuses and rewards',
      'No commission on winnings',
      'Exclusive live events',
      'Priority leaderboard placement',
      'Access to closed premium communities'
    ],
    description: 'For professionals and winners'
  }
} as const;

export type MasterChefTierId = typeof MASTERCHEF_TIERS[keyof typeof MASTERCHEF_TIERS]['id'];

export const getMasterChefTier = (tierId: string) => {
  return Object.values(MASTERCHEF_TIERS).find(t => t.id === tierId);
};

export const hasMasterChefTier = (currentTier: string | null, requiredTierId: string) => {
  if (!currentTier) return false;
  
  const tiers = Object.values(MASTERCHEF_TIERS);
  const currentTierIndex = tiers.findIndex(t => t.id === currentTier);
  const requiredTierIndex = tiers.findIndex(t => t.id === requiredTierId);
  
  // Higher tier includes lower tier features
  return currentTierIndex >= requiredTierIndex;
};
