import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createSubscriptionCheckHandler } from "../_shared/subscription.ts";

serve(createSubscriptionCheckHandler({
  functionName: "check-masterchef-subscription",
  useProductId: true,
  responseMapping: (data) => ({
    subscribed: data.subscribed,
    tier: data.product_id,
    subscription_end: data.subscription_end,
  }),
}));
