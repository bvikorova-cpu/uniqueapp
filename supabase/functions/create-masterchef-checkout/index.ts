import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createFlexibleCheckoutHandler } from "../_shared/checkout.ts";

serve(createFlexibleCheckoutHandler({
  successUrl: "/masterchef/dashboard?success=true",
  cancelUrl: "/masterchef-subscription?canceled=true",
  defaultMode: "subscription",
  metadataFields: ["tier"],
}, "CREATE-MASTERCHEF-CHECKOUT"));
