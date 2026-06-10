import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createFlexibleCheckoutHandler } from "../_shared/checkout.ts";

serve(createFlexibleCheckoutHandler({
  functionName: "create-masterchef-checkout",
  successPath: "/masterchef/dashboard?success=true",
  cancelPath: "/masterchef-subscription?canceled=true",
  defaultMode: "subscription",
  metadataFields: ["tier"],
}));
