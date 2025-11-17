// Time Reversal Product Mappings
// IMPORTANT: Replace these product IDs with your actual Stripe product IDs

export const TIME_REVERSAL_PRODUCTS = {
  TIME_TRAVEL_SPEED: {
    id: 'prod_TMRm1jb3zE5js2',
    name: 'Time Travel Speed',
    price: '€6.99',
    priceId: 'price_1SPitHGaXSfGtYFtD5qWM26P',
    features: [
      '2x faster aging reversal',
      'Custom speed settings',
      'Fast-forward through decades',
      'Priority timeline updates'
    ],
    description: 'Age backwards faster than ever'
  },
  AGE_LOCKS: {
    id: 'prod_TMRnhkeFy9ex4r',
    name: 'Age Locks',
    price: '€4.99',
    priceId: 'price_1SPitb0QTWhd4oRpSUpKFiYN',
    features: [
      'Unlimited age lock points',
      'Pause at any age you want',
      'Create custom milestones',
      'Resume aging anytime'
    ],
    description: 'Freeze time at your perfect age'
  },
  FUTURE_GLIMPSE: {
    id: 'prod_TMRnPTkfIFqUKR',
    name: 'Future Glimpse',
    price: '€2.99',
    priceId: 'price_1SPitv0QTWhd4oRpT3MCvpTR',
    features: [
      'Preview any future age',
      'AI-generated future photos',
      'Timeline exploration',
      'What-if scenarios'
    ],
    description: 'See your future self'
  }
} as const;

export type TimeReversalProductId = typeof TIME_REVERSAL_PRODUCTS[keyof typeof TIME_REVERSAL_PRODUCTS]['id'];

export const getTimeReversalProduct = (productId: string) => {
  return Object.values(TIME_REVERSAL_PRODUCTS).find(p => p.id === productId);
};

export const hasTimeReversalFeature = (activeFeatures: string[], productId: string) => {
  return activeFeatures.includes(productId);
};
