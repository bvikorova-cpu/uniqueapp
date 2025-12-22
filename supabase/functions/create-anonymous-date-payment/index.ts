import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createPackageCheckoutHandler } from "../_shared/checkout.ts";

serve(createPackageCheckoutHandler({
  functionName: "create-anonymous-date-payment",
  packages: {
    basic: { credits: 10, price: "price_1SZqh2GaXSfGtYFtJ1mLlKI5" },
    standard: { credits: 30, price: "price_1SZqh3GaXSfGtYFtBhFqizjr" },
    premium: { credits: 100, price: "price_1SZqh4GaXSfGtYFtFxVAaHzw" },
    ultimate: { credits: 300, price: "price_1SZqh4GaXSfGtYFtekImXJnO" },
  },
  successPath: "/anonymous-date?success=true",
  cancelPath: "/anonymous-date?canceled=true",
  metadataType: "anonymous_dating_credits",
}));
