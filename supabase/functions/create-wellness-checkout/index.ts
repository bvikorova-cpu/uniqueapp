import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createFlexibleCheckoutHandler } from "../_shared/checkout.ts";

serve(createFlexibleCheckoutHandler({
  functionName: "create-wellness-checkout",
  successPath: "/wellness?success=true",
  cancelPath: "/wellness",
  defaultMode: "subscription",
  metadata: { type: "wellness_subscription" },
  metadataFields: ["tier"],
}));
