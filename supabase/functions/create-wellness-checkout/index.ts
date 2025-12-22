import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createFlexibleCheckoutHandler } from "../_shared/checkout.ts";

serve(createFlexibleCheckoutHandler({
  successUrl: "/wellness?success=true",
  cancelUrl: "/wellness",
  defaultMode: "subscription",
  metadataFields: ["tier"],
}, "CREATE-WELLNESS-CHECKOUT"));
