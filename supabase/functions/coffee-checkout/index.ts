import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createDynamicCheckoutHandler } from "../_shared/checkout.ts";

serve(createDynamicCheckoutHandler({
  functionName: "coffee-checkout",
  tierPrices: {
    lover: "price_1THrSyGaXSfGtYFt6QqTaFtp",
    expert: "price_1THrSzGaXSfGtYFtZy3W6TkX",
  },
  mode: "subscription",
  successPath: "/coffee?payment=success",
  cancelPath: "/coffee?payment=canceled",
  metadata: { type: "coffee_subscription" },
}));
