import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createFlexibleCheckoutHandler } from "../_shared/checkout.ts";

serve(createFlexibleCheckoutHandler({
  functionName: "create-coloring-subscription",
  successPath: "/coloring-pages?success=true&session_id={CHECKOUT_SESSION_ID}",
  cancelPath: "/coloring-pages?canceled=true",
  defaultMode: "subscription",
  metadataFields: ["tier", "credits"],
  metadata: { type: "coloring_subscription" },
}));
