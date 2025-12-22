import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createSubscriptionCheckHandler } from "../_shared/subscription.ts";

const TIER_MAPPING: Record<string, string> = {
  "price_1SRv390QTWhd4oRpM8xbH4hm": "pediatric_mini",
  "price_1SRv3SGaXSfGtYFtIxUFVzYa": "pediatric_standard",
  "price_1SRv3mGaXSfGtYFtAKPsmIuj": "dental_plus",
  "price_1SRv420QTWhd4oRpAwuVmcrG": "therapy_lite",
  "price_1SRv4h0QTWhd4oRpv9tvXboN": "therapy_professional",
  "price_1SRvD3GaXSfGtYFtlBnIKIq8": "clinic_premium",
  "price_1SRvDeGaXSfGtYFtCj31V4Wi": "hospital_package",
  "price_1SRvDyGaXSfGtYFtlGV3f3Zs": "oncology_pediatric",
  "price_1SRvEH0QTWhd4oRptr7evlXq": "physiotherapy",
  "price_1SRvEaGaXSfGtYFt5QEbP47H": "speech_therapy",
  "price_1SRvF7GaXSfGtYFtcg0vJI7H": "occupational_therapy",
  "price_1SRvFQ0QTWhd4oRpHT6IP5tg": "adhd_specialist",
  "price_1SRvFjGaXSfGtYFt303VBIYt": "autism_center",
};

serve(createSubscriptionCheckHandler({
  functionName: "check-healthcare-subscription",
  tierMapping: TIER_MAPPING,
  tableName: "healthcare_profiles",
  defaultResponse: { 
    subscribed: false,
    subscription_tier: 'none',
    subscription_status: 'inactive'
  },
  additionalFields: async (supabase, userId, tier, _productId) => {
    const status = tier ? 'active' : 'inactive';
    await supabase
      .from('healthcare_profiles')
      .upsert({ 
        user_id: userId,
        subscription_status: status,
        subscription_tier: tier || 'none'
      }, { onConflict: 'user_id' });
    
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
