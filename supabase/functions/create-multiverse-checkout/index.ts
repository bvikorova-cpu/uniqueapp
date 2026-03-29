import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createServiceCheckoutHandler } from "../_shared/checkout.ts";

serve(createServiceCheckoutHandler({
  functionName: "create-multiverse-checkout",
  servicePrices: {
    universe_creation: "price_1SPjwKGaXSfGtYFtNVmaCIwG",
    reality_jumping: "price_1SPjwiGaXSfGtYFtztOZZzQz",
    timeline_merging: "price_1SPjxQGaXSfGtYFtZcov9TSN",
    best_self_selection: "price_1SPjxjGaXSfGtYFtLcZuEuWE",
  },
  subscriptionServices: ["reality_jumping", "best_self_selection"],
  successPath: "/multiverse-network?payment=success&session_id={CHECKOUT_SESSION_ID}",
  cancelPath: "/multiverse-network?payment=canceled",
  metadata: { type: "multiverse_service" },
}));
