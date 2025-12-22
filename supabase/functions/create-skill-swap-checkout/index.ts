import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createCheckoutHandler } from "../_shared/checkout.ts";

serve(createCheckoutHandler({
  functionName: "create-skill-swap-checkout",
  productName: "Global Skill Swap Premium",
  productDescription: "Monthly subscription for global skill exchanges and video lessons",
  priceAmount: 499,
  currency: "eur",
  mode: "subscription",
  recurringInterval: "month",
  successPath: "/skill-swap?success=true&session_id={CHECKOUT_SESSION_ID}",
  cancelPath: "/skill-swap?canceled=true",
  metadata: { type: "skill_swap_subscription" },
}));
