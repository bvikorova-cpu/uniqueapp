import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createDynamicCheckoutHandler } from "../_shared/checkout.ts";

serve(createDynamicCheckoutHandler({
  functionName: "create-sports-checkout",
  tierPrices: {
    ai_premium: "price_1STswBGaXSfGtYFtPuR1gm9l",
    expert_tipster: "price_1STswCGaXSfGtYFtSzprLrpi",
  },
  mode: "subscription",
  successPath: "/sports-predictor",
  cancelPath: "/sports-predictor",
  tierKey: "tier",
}));
