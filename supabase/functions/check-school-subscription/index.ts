import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createSubscriptionCheckHandler } from "../_shared/subscription.ts";

const TIER_MAPPING: Record<string, string> = {
  "price_1SMprw0QTWhd4oRpQWjUkKA2": "kindergarten",
  "price_1SMpsK0QTWhd4oRp7oXQpFXh": "elementary",
  "price_1SMpsg0QTWhd4oRpAIDNGOvv": "premium",
};

serve(createSubscriptionCheckHandler({
  functionName: "check-school-subscription",
  tierMapping: TIER_MAPPING,
  tableName: "school_profiles",
  defaultResponse: { 
    subscribed: false,
    subscription_tier: 'none',
    subscription_status: 'inactive'
  },
  additionalFields: async (supabase, userId, tier, _productId) => {
    const status = tier ? 'active' : 'inactive';
    await supabase
      .from('school_profiles')
      .update({ 
        subscription_status: status,
        subscription_tier: tier || 'none'
      })
      .eq('user_id', userId);
    
    return {
      subscription_tier: tier || 'none',
      subscription_status: status,
    };
  },
  responseMapping: (data) => ({
    subscribed: data.subscribed,
    subscription_tier: data.subscription_tier || data.tier || 'none',
    subscription_status: data.subscribed ? 'active' : 'inactive',
    subscription_end: data.subscription_end,
  }),
}));
