import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createDynamicCheckoutHandler } from "../_shared/checkout.ts";

serve(createDynamicCheckoutHandler({
  functionName: "create-kids-story-subscription-checkout",
  tierPrices: {
    monthly: "price_1SShj2GaXSfGtYFtcKlTJYGa",
    annual: "price_1SShj3GaXSfGtYFtGEneXVhs",
  },
  mode: "subscription",
  successPath: "/kids-story-creator",
  cancelPath: "/kids-story-pricing",
  tierKey: "tier",
}));
