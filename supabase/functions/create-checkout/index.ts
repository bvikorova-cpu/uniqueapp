import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createCreditsCheckoutHandler } from "../_shared/checkout.ts";

const PRICE_IDS: Record<number, string> = {
  10: "price_1SOII2GaXSfGtYFtPltUZvxb",
  25: "price_1SOIIMGaXSfGtYFtonaY4jqs",
  60: "price_1SOIItGaXSfGtYFtvHTuEutU",
  150: "price_1SOIJE0QTWhd4oRpow80Xeyd",
};

serve(createCreditsCheckoutHandler(
  PRICE_IDS,
  "/antique-appraisal",
  "/antique-appraisal",
  "antique_credits",
  "CREATE-CHECKOUT"
));
