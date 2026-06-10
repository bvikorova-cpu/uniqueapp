import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createFlexibleCheckoutHandler } from "../_shared/checkout.ts";

serve(createFlexibleCheckoutHandler({
  functionName: "create-time-reversal-checkout",
  successPath: "/time-reversal/timeline?success=true",
  cancelPath: "/time-reversal-subscription?canceled=true",
  defaultMode: "subscription",
  metadata: { type: "time_reversal_subscription" },
  metadataFields: ["featureName"],
}));
