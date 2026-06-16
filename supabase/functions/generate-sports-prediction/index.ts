// Stub — feature pending implementation. Returns a clear error so the frontend
// can show a user-friendly message instead of a FunctionsFetchError.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve((req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  return new Response(
    JSON.stringify({ error: "Sports prediction service is temporarily unavailable. Try again later." }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 503 },
  );
});
