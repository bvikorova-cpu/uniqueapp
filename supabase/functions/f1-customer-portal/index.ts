import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createCustomerPortalHandler } from "../_shared/subscription.ts";

serve(createCustomerPortalHandler({
  functionName: "f1-customer-portal",
  returnPath: "/f1-subscription",
}));
