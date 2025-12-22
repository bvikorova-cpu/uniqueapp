import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createSubscriptionCheckHandler } from "../_shared/subscription.ts";

const TIER_MAPPING: Record<string, string> = {
  "price_1SPi5GGaXSfGtYFtlHoasCWx": "pro",
  "price_1SPi5XGaXSfGtYFtnJalF08v": "elite",
  "price_1SPi5o0QTWhd4oRpvgi8IB9R": "team",
};

serve(createSubscriptionCheckHandler({
  functionName: "check-f1-subscription",
  tierMapping: TIER_MAPPING,
}));
