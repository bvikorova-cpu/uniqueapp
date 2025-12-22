import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createSubscriptionCheckHandler } from "../_shared/subscription.ts";

serve(createSubscriptionCheckHandler({
  functionName: "check-decor-subscription",
  tableName: "decor_subscriptions",
  defaultResponse: { 
    subscribed: false, 
    product_id: null, 
    subscription_end: null, 
    designs_used: 0, 
    designs_limit: 0 
  },
  additionalFields: async (supabase, userId, _tier, _productId) => {
    const { data: existingSub } = await supabase
      .from("decor_subscriptions")
      .select("designs_used")
      .eq("user_id", userId)
      .maybeSingle();

    const designsUsed = existingSub?.designs_used || 0;

    // Upsert subscription record
    await supabase
      .from("decor_subscriptions")
      .upsert({
        user_id: userId,
        tier: "pro",
        designs_used: designsUsed,
        designs_limit: 50,
      }, { onConflict: "user_id" });

    return {
      designs_used: designsUsed,
      designs_limit: 50,
    };
  },
}));
