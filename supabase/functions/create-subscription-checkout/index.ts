import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createDynamicCheckoutHandler } from "../_shared/checkout.ts";

serve(createDynamicCheckoutHandler({
  functionName: "create-subscription-checkout",
  tierPrices: {
    basic: "price_1SOIGmGaXSfGtYFt7tBei4Di",
    premium: "price_1SOIH6GaXSfGtYFtWImRsIC4",
    business: "price_1SOIHRGaXSfGtYFtArYKBnHy",
  },
  mode: "subscription",
  successPath: "/subscription?success=true",
  cancelPath: "/subscription?canceled=true",
  metadata: { type: "subscription" },
}));
