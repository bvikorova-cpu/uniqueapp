import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createCheckoutHandler } from "../_shared/checkout.ts";

serve(createCheckoutHandler({
  functionName: "create-vip-checkout",
  priceId: "price_1SOIMT0QTWhd4oRpQu1A3qwK",
  mode: "subscription",
  successPath: "/collectibles?vip=success",
  cancelPath: "/collectibles?vip=canceled",
  metadata: { type: "vip_subscription" },
}));
