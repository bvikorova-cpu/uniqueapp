// Thin proxy → check-subscription with tier="holographic"
// Validates the caller's JWT against Supabase Auth before proxying so anon
// callers (who only carry the project anon key) are rejected with 401.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: auth } },
  });
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const r = await fetch(`${SUPABASE_URL}/functions/v1/check-subscription`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: auth,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ tier: "holographic" }),
  });
  const body = await r.text();
  return new Response(body, {
    status: r.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
