import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createCheckoutHandler } from "../_shared/checkout.ts";

serve(createCheckoutHandler({
  priceId: "price_1SSy34GaXSfGtYFtlieyFsu0",
  mode: "subscription",
  successUrl: "/kids-drawing-buddy?success=true",
  cancelUrl: "/kids-drawing-buddy",
}, "CREATE-KIDS-DRAWING-CHECKOUT"));
