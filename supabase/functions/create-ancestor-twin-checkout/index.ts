import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createFlexibleCheckoutHandler } from "../_shared/checkout.ts";

serve(createFlexibleCheckoutHandler({
  functionName: "create-ancestor-twin-checkout",
  priceIdFromBody: "priceId",
  successPath: "/ancestor-twin?success=true",
  cancelPath: "/ancestor-twin?canceled=true",
  metadataFields: ["tier"],
}));
