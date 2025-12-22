import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createDynamicCheckoutHandler } from "../_shared/checkout.ts";

serve(createDynamicCheckoutHandler({
  priceIds: {
    monthly: "price_1SShj2GaXSfGtYFtcKlTJYGa",
    annual: "price_1SShj3GaXSfGtYFtGEneXVhs",
  },
  mode: "subscription",
  successUrlBase: "/kids-story-creator",
  cancelUrlBase: "/kids-story-pricing",
  tierParam: "tier",
}, "CREATE-KIDS-STORY-SUBSCRIPTION-CHECKOUT"));
