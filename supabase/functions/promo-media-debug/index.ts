import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );
  const folder = new URL(req.url).searchParams.get("f") ?? "";
  const { data, error } = await supabase.storage.from("promotions").list(folder, { limit: 100 });
  return new Response(JSON.stringify({ data, error }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
