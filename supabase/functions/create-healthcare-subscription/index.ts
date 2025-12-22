import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createFlexibleCheckoutHandler } from "../_shared/checkout.ts";

serve(createFlexibleCheckoutHandler({
  successUrl: "/healthcare?success=true",
  cancelUrl: "/healthcare?canceled=true",
  defaultMode: "subscription",
}, "CREATE-HEALTHCARE-SUBSCRIPTION"));
