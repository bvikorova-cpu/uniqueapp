import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createSubscriptionCheckHandler } from "../_shared/subscription.ts";

const TIER_MAPPING: Record<string, { name: string; maxPets: number }> = {
  "prod_TMxIAIiKlSWTef": { name: "Pet Parent", maxPets: 1 },
  "prod_TMxI5ZbjB28R6Z": { name: "Multi-Pet", maxPets: 5 },
  "prod_TMxIMYFcwmvzvV": { name: "Pet Psychologist", maxPets: 999 },
};

serve(createSubscriptionCheckHandler({
  functionName: "check-pet-subscription",
  useProductId: true,
  defaultResponse: { 
    subscribed: false, 
    product_id: null, 
    tier: null, 
    subscription_end: null, 
    max_pets: 0, 
    pets_tracked: 0 
  },
  additionalFields: async (_supabase, _userId, _tier, productId) => {
    const planInfo = productId ? TIER_MAPPING[productId] : null;
    return {
      tier: planInfo?.name || null,
      max_pets: planInfo?.maxPets || 0,
      pets_tracked: 0,
    };
  },
}));
