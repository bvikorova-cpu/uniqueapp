import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createCheckoutHandler } from "../_shared/checkout.ts";

serve(createCheckoutHandler({
  functionName: "create-psychology-checkout",
  productName: "Psychology Premium",
  productDescription: "Unlimited conversations with your AI psychologist",
  priceAmount: 500,
  currency: "eur",
  mode: "subscription",
  recurringInterval: "month",
  successPath: "/psychologist?success=true",
  cancelPath: "/psychologist?canceled=true",
  metadata: { feature: "psychology" },
}));
