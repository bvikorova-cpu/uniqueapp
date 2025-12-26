import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createCheckoutHandler } from "../_shared/checkout.ts";

serve(createCheckoutHandler({
  functionName: "purchase-best-friend-messages",
  productName: "100 Extra Best Friend Messages",
  productDescription: "100 additional messages for AI Best Friend",
  priceAmount: 200,
  currency: "eur",
  mode: "payment",
  successPath: "/best-friend?purchase=success",
  cancelPath: "/best-friend?purchase=canceled",
  metadata: { feature: "best_friend_bonus", bonus_messages: "100" },
}));
