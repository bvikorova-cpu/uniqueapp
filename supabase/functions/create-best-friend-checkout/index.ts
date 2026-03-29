import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createCheckoutHandler } from "../_shared/checkout.ts";

serve(createCheckoutHandler({
  functionName: "create-best-friend-checkout",
  productName: "Best Friend Premium",
  productDescription: "Unlimited conversations with your AI best friend",
  priceAmount: 1500,
  currency: "eur",
  mode: "subscription",
  recurringInterval: "month",
  successPath: "/best-friend?success=true",
  cancelPath: "/best-friend?canceled=true",
  metadata: { type: "best_friend_subscription", feature: "best_friend" },
}));
