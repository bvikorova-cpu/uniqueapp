import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const username = (url.searchParams.get("username") || "").toLowerCase().trim();
    if (!/^[a-z0-9_-]{3,24}$/.test(username)) {
      return new Response(JSON.stringify({ available: false, reason: "invalid" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await admin.from("profiles").select("id").ilike("username", username).limit(1).maybeSingle();
    if (error) throw error;
    return new Response(JSON.stringify({ available: !data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ available: false, error: (e as Error).message }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
