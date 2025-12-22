import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createCheckoutHandler } from "../_shared/checkout.ts";

serve(createCheckoutHandler({
  functionName: "create-kids-reading-checkout",
  priceId: "price_1SSy34GaXSfGtYFtlieyFsu0",
  mode: "subscription",
  successPath: "/kids-reading-companion?success=true",
  cancelPath: "/kids-reading-companion?canceled=true",
}));
