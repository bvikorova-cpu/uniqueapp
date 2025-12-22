import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createServiceCheckoutHandler } from "../_shared/checkout.ts";

serve(createServiceCheckoutHandler({
  functionName: "create-phobia-checkout",
  servicePrices: {
    fear_marketplace: "price_1SPjrKGaXSfGtYFt8B9uWDjF",
    phobia_cure: "price_1SPjriGaXSfGtYFt441gvmkd",
    exposure_therapy: "price_1SPjs0GaXSfGtYFtAOZPXaIR",
    rare_fear_collector: "price_1SPjsJGaXSfGtYFtRyomXHBz",
  },
  subscriptionServices: ["fear_marketplace", "phobia_cure", "rare_fear_collector"],
  successPath: "/phobia-trading?payment=success&session_id={CHECKOUT_SESSION_ID}",
  cancelPath: "/phobia-trading?payment=canceled",
}));
