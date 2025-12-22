import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createFlexibleCheckoutHandler } from "../_shared/checkout.ts";

serve(createFlexibleCheckoutHandler({
  functionName: "create-healthcare-subscription",
  successPath: "/healthcare?success=true",
  cancelPath: "/healthcare?canceled=true",
  defaultMode: "subscription",
}));
