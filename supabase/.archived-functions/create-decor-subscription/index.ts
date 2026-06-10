import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createCheckoutHandler } from "../_shared/checkout.ts";

serve(createCheckoutHandler({
  functionName: "create-decor-subscription",
  priceId: "price_1SVAKhGaXSfGtYFtK1yiOMde",
  mode: "subscription",
  successPath: "/home-decor?success=true",
  cancelPath: "/home-decor?canceled=true",
  metadata: { type: "decor_pro_subscription" },
}));
