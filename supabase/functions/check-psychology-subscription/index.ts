// Thin proxy → check-subscription with tier="psychology"
// See supabase/functions/check-subscription/index.ts for logic.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/check-subscription`;
  const auth = req.headers.get("Authorization") ?? "";
  const apikey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: auth, apikey },
    body: JSON.stringify({ tier: "psychology" }),
  });
  const body = await r.text();
  return new Response(body, { status: r.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
