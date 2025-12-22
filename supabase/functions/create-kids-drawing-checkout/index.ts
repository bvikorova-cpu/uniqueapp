import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createCheckoutHandler } from "../_shared/checkout.ts";

serve(createCheckoutHandler({
  functionName: "create-kids-drawing-checkout",
  priceId: "price_1SSy34GaXSfGtYFtlieyFsu0",
  mode: "subscription",
  successPath: "/kids-drawing-buddy?success=true",
  cancelPath: "/kids-drawing-buddy",
}));
