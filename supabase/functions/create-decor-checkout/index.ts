import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createCheckoutHandler } from "../_shared/checkout.ts";

serve(createCheckoutHandler({
  functionName: "create-decor-checkout",
  priceId: "price_1SQBtSGaXSfGtYFtKMijDxGm",
  mode: "subscription",
  successPath: "/home-decor-subscription?success=true",
  cancelPath: "/home-decor-subscription?canceled=true",
}));
