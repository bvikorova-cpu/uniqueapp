import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createDynamicCheckoutHandler } from "../_shared/checkout.ts";

serve(createDynamicCheckoutHandler({
  products: {
    basic: { name: "AI Clone Basic", priceAmount: 999 },
    advanced: { name: "AI Clone Advanced", priceAmount: 2999 },
    celebrity: { name: "AI Clone Celebrity", priceAmount: 9900 },
    battle: { name: "Clone Battle", priceAmount: 199 },
    dating: { name: "Clone Dating Session", priceAmount: 499 },
    export: { name: "Conversation Export", priceAmount: 200 },
  },
  successUrl: "/ai-clone?payment=success",
  cancelUrl: "/ai-clone?payment=canceled",
}));
