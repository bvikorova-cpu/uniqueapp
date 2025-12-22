import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createFlexibleCheckoutHandler } from "../_shared/checkout.ts";

serve(createFlexibleCheckoutHandler({
  functionName: "create-f1-checkout",
  successPath: "/f1-racing?success=true",
  cancelPath: "/f1-subscription?canceled=true",
  defaultMode: "subscription",
  metadataFields: ["tier"],
}));
