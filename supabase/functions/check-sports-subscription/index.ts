import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createSubscriptionCheckHandler } from "../_shared/subscription.ts";

const TIER_MAPPING: Record<string, string> = {
  "price_1STswBGaXSfGtYFtPuR1gm9l": "ai_premium",
  "price_1STswCGaXSfGtYFtSzprLrpi": "expert_tipster",
};

serve(createSubscriptionCheckHandler({
  functionName: "check-sports-subscription",
  tierMapping: TIER_MAPPING,
  tableName: "sports_ai_subscriptions",
  additionalFields: async (supabase, userId, tier, _productId) => {
    if (tier) {
      await supabase
        .from('sports_ai_subscriptions')
        .upsert({
          user_id: userId,
          tier,
          status: 'active',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
    }
    return {};
  },
}));
