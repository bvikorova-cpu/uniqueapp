import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createFlexibleCheckoutHandler } from "../_shared/checkout.ts";

serve(createFlexibleCheckoutHandler({
  functionName: "create-pet-checkout",
  successPath: "/pet-translator?success=true",
  cancelPath: "/pet-translator-pricing?canceled=true",
}));
