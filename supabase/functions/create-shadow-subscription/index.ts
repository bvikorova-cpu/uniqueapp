// Thin proxy → create-checkout with product="shadow_subscription"
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/create-checkout`;
    const auth = req.headers.get("Authorization") ?? "";
    const apikey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const origin = req.headers.get("origin") || "https://uniqueapp.fun";

    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
        apikey,
        origin, // forward so create-checkout can build absolute URLs
      },
      body: JSON.stringify({
        product: "shadow_subscription",
        mode: "subscription",
        successUrl: `${origin}/shadow-arena/dashboard?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/shadow-arena/dashboard?subscription=canceled`,
      }),
    });
    const body = await r.text();
    return new Response(body, {
      status: r.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("create-shadow-subscription error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
