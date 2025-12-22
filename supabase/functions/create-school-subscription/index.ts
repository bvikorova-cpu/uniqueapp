import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createDynamicCheckoutHandler } from "../_shared/checkout.ts";

serve(createDynamicCheckoutHandler({
  functionName: "create-school-subscription",
  tierPrices: {
    kindergarten: "price_1SMprw0QTWhd4oRpQWjUkKA2",
    elementary: "price_1SMpsK0QTWhd4oRp7oXQpFXh",
    premium: "price_1SMpsg0QTWhd4oRpAIDNGOvv",
  },
  tierKey: "tier",
  mode: "subscription",
  successPath: "/schools?success=true&session_id={CHECKOUT_SESSION_ID}",
  cancelPath: "/schools?canceled=true",
  metadataFn: (body) => ({
    tier: String(body.tier || ""),
    type: "school_subscription",
  }),
}));
