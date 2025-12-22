import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createCreditsCheckoutHandler } from "../_shared/checkout.ts";

const CREDIT_PACKAGES: Record<number, string> = {
  10: "price_1SfS1gGaXSfGtYFt5TvUlbqj",
  30: "price_1SfS1gGaXSfGtYFtsdrywoIA",
  100: "price_1SfS1iGaXSfGtYFtQWhpRXAM",
};

serve(createCreditsCheckoutHandler(
  CREDIT_PACKAGES,
  "/astrology",
  "/astrology",
  "astrology_credits",
  "CREATE-ASTROLOGY-CHECKOUT"
));
