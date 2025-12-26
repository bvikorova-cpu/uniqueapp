import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createCheckoutHandler } from "../_shared/checkout.ts";

serve(createCheckoutHandler({
  functionName: "purchase-psychology-messages",
  productName: "100 Extra Psychology Messages",
  productDescription: "100 additional messages for AI Psychologist",
  priceAmount: 200,
  currency: "eur",
  mode: "payment",
  successPath: "/psychologist?purchase=success",
  cancelPath: "/psychologist?purchase=canceled",
  metadata: { feature: "psychology_bonus", bonus_messages: "100" },
}));
