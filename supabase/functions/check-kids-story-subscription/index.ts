import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createSubscriptionCheckHandler } from "../_shared/subscription.ts";

serve(createSubscriptionCheckHandler({
  functionName: "check-kids-story-subscription",
  useProductId: true,
}));
