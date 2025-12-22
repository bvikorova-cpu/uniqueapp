import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createCheckoutHandler } from "../_shared/checkout.ts";

serve(createCheckoutHandler({
  functionName: "create-shadow-subscription",
  priceId: "price_1SW2xDGaXSfGtYFt29Cgybu5",
  mode: "subscription",
  successPath: "/shadow-arena/dashboard?success=true",
  cancelPath: "/shadow-arena?canceled=true",
}));
