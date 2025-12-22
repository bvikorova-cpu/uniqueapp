import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createCheckoutHandler } from "../_shared/checkout.ts";

serve(createCheckoutHandler({
  functionName: "create-companions-checkout",
  lookupKey: "companions_monthly",
  productName: "AI Companions Subscription",
  productDescription: "Unlimited conversations with AI Companions",
  priceAmount: 500,
  currency: "eur",
  mode: "subscription",
  recurringInterval: "month",
  successPath: "/companions?success=true",
  cancelPath: "/companions?canceled=true",
  metadata: { type: "companions" },
}));
