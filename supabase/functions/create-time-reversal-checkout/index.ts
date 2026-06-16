import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createSubscriptionCheckout } from "../_shared/subscriptionCheckout.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { priceId, featureName } = await req.json();
    const result = await createSubscriptionCheckout(req, priceId, {
      successPath: "/time-reversal?payment=success&session_id={CHECKOUT_SESSION_ID}",
      cancelPath: "/time-reversal?payment=canceled",
      metadata: { module: "time_reversal", feature: featureName ?? "" },
    });
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
