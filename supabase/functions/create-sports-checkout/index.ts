import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createDynamicCheckoutHandler } from "../_shared/checkout.ts";

serve(createDynamicCheckoutHandler({
  priceIds: {
    ai_premium: "price_1STswBGaXSfGtYFtPuR1gm9l",
    expert_tipster: "price_1STswCGaXSfGtYFtSzprLrpi",
  },
  mode: "subscription",
  successUrlBase: "/sports-predictor",
  cancelUrlBase: "/sports-predictor",
  tierParam: "tier",
}, "CREATE-SPORTS-CHECKOUT"));
