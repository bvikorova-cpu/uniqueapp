import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createSubscriptionCheckHandler } from "../_shared/subscription.ts";

serve(createSubscriptionCheckHandler({
  functionName: "check-shadow-subscription",
  tableName: "shadow_subscriptions",
  additionalFields: async (supabase, userId, _tier, _productId) => {
    // Will be handled by the shared handler's subscription upsert
    return {};
  },
}));
