import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createCheckoutHandler } from "../_shared/checkout.ts";

serve(createCheckoutHandler({
  priceId: "price_1STtBV0QTWhd4oRpJUGoW9Lk",
  mode: "subscription",
  successUrl: "/sports-predictor?tipster_success=true",
  cancelUrl: "/sports-predictor?tipster_cancel=true",
  metadata: { type: "tipster_subscription" },
}, "CREATE-TIPSTER-CHECKOUT"));
