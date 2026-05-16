// Thin proxy → check-subscription with tier="time_capsule"
// See supabase/functions/check-subscription/index.ts for logic.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Validate JWT belongs to a real user (reject anon key)
  const sb = (await import("https://esm.sh/@supabase/supabase-js@2.57.2")).createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );
  const { data: { user } } = await sb.auth.getUser(auth.replace("Bearer ", ""));
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/check-subscription`;
  const apikey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: auth, apikey },
    body: JSON.stringify({ tier: "time_capsule" }),
  });
  const body = await r.text();
  return new Response(body, { status: r.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
