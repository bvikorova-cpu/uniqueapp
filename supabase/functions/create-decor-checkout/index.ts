import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createCheckoutHandler } from "../_shared/checkout.ts";

serve(createCheckoutHandler({
  priceId: "price_1SQBtSGaXSfGtYFtKMijDxGm",
  mode: "subscription",
  successUrl: "/home-decor-subscription?success=true",
  cancelUrl: "/home-decor-subscription?canceled=true",
}, "CREATE-DECOR-CHECKOUT"));
