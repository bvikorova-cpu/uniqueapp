import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createFlexibleCheckoutHandler } from "../_shared/checkout.ts";

serve(createFlexibleCheckoutHandler({
  functionName: "create-voice-subscription-checkout",
  priceIdFromBody: "priceId",
  mode: "subscription",
  successPath: "/voice-memorial?success=true",
  cancelPath: "/voice-memorial-pricing?canceled=true",
  metadata: { type: "voice_subscription" },
}));
