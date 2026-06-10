import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createFlexibleCheckoutHandler } from "../_shared/checkout.ts";

serve(createFlexibleCheckoutHandler({
  functionName: "create-lottery-subscription",
  successPath: "/lottery-ai?success=true&session_id={CHECKOUT_SESSION_ID}",
  cancelPath: "/lottery-ai?canceled=true",
  defaultMode: "subscription",
  metadata: { type: "lottery_subscription" },
}));
