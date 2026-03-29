import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createCheckoutHandler } from "../_shared/checkout.ts";

serve(createCheckoutHandler({
  functionName: "create-science-checkout",
  priceId: "price_1SSxUBGaXSfGtYFtKRW4zs3A",
  mode: "subscription",
  successPath: "/kids-science-lab?success=true",
  cancelPath: "/kids-science-lab",
  metadata: { type: "science_subscription" },
}));
