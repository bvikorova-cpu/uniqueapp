// Thin proxy → customer-portal (universal Stripe billing portal).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/customer-portal`;
  const auth = req.headers.get("Authorization") ?? "";
  const apikey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  let body = "{}";
  try { body = await req.text(); } catch {}
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: auth, apikey, origin: req.headers.get("origin") ?? "https://uniqueapp.fun" },
    body,
  });
  const text = await r.text();
  return new Response(text, { status: r.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
