import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createFlexibleCheckoutHandler } from "../_shared/checkout.ts";

serve(createFlexibleCheckoutHandler({
  successUrl: "/f1-racing?success=true",
  cancelUrl: "/f1-subscription?canceled=true",
  defaultMode: "subscription",
  metadataFields: ["tier"],
}, "CREATE-F1-CHECKOUT"));
