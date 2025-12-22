import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createCheckoutHandler } from "../_shared/checkout.ts";

serve(createCheckoutHandler({
  priceId: "price_1SOIMT0QTWhd4oRpQu1A3qwK",
  mode: "subscription",
  successUrl: "/collectibles?vip=success",
  cancelUrl: "/collectibles?vip=canceled",
  metadata: { type: "vip_subscription" },
}, "CREATE-VIP-CHECKOUT"));
