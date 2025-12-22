import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createSubscriptionCheckHandler } from "../_shared/subscription.ts";

const SUBSCRIPTION_TIERS: Record<string, string> = {
  "price_1SQ5bv0QTWhd4oRpEQwOsKMQ": "basic",
  "price_1SQ5cIGaXSfGtYFtKghPwnpp": "pro",
};

serve(createSubscriptionCheckHandler({
  functionName: "check-subscription",
  tierMapping: SUBSCRIPTION_TIERS,
  tableName: "user_subscriptions",
  additionalFields: async (supabase, userId, tier, _productId) => {
    const { data } = await supabase
      .from("user_subscriptions")
      .select("generations_used, generations_limit")
      .eq("user_id", userId)
      .maybeSingle();
    
    return {
      limit: tier === "pro" ? -1 : (data?.generations_limit || 10),
      generations_used: data?.generations_used || 0,
    };
  },
}));
