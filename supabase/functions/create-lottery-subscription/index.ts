import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createFlexibleCheckoutHandler } from "../_shared/checkout.ts";

serve(createFlexibleCheckoutHandler({
  successUrl: "/lottery-ai?success=true&session_id={CHECKOUT_SESSION_ID}",
  cancelUrl: "/lottery-ai?canceled=true",
  defaultMode: "subscription",
  metadata: { type: "lottery_subscription" },
}, "CREATE-LOTTERY-SUBSCRIPTION"));
