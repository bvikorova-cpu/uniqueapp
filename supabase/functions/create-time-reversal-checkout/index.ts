import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createFlexibleCheckoutHandler } from "../_shared/checkout.ts";

serve(createFlexibleCheckoutHandler({
  successUrl: "/time-reversal/timeline?success=true",
  cancelUrl: "/time-reversal-subscription?canceled=true",
  defaultMode: "subscription",
  metadataFields: ["featureName"],
}, "CREATE-TIME-REVERSAL-CHECKOUT"));
