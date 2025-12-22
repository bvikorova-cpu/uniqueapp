import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createSubscriptionCheckHandler } from "../_shared/subscription.ts";

serve(createSubscriptionCheckHandler({
  functionName: "check-ancestor-twin-subscription",
  defaultResponse: { hasSubscription: false, subscriptionEnd: null },
  responseMapping: (data: Record<string, unknown>) => ({
    hasSubscription: data.subscribed,
    subscriptionEnd: data.subscription_end,
  }),
}));
