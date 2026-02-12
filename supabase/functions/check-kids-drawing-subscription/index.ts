import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createSubscriptionCheckHandler } from "../_shared/subscription.ts";

serve(createSubscriptionCheckHandler({
  functionName: "check-kids-drawing-subscription",
  responseMapping: (data) => ({
    subscribed: data.subscribed,
    subscription_end: data.subscription_end || null,
    tutorials_used: 0,
    tutorials_limit: data.subscribed ? 999999 : 1,
  }),
}));
