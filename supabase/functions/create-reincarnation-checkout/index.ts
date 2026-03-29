import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createServiceCheckoutHandler } from "../_shared/checkout.ts";

serve(createServiceCheckoutHandler({
  functionName: "create-reincarnation-checkout",
  servicePrices: {
    past_life_regression: "price_1SPjh3GaXSfGtYFtJtNPpfLW",
    karmic_debt_calculator: "price_1SPjhOGaXSfGtYFthjLY6swA",
    soulmate_matching: "price_1SPjhiGaXSfGtYFtCUh37C4U",
    reincarnation_guarantee: "price_1SPji6GaXSfGtYFtKowBlsZV",
  },
  subscriptionServices: ["karmic_debt_calculator", "soulmate_matching"],
  successPath: "/reincarnation-social?payment=success&session_id={CHECKOUT_SESSION_ID}",
  cancelPath: "/reincarnation-social?payment=canceled",
  metadata: { type: "reincarnation_service" },
}));
