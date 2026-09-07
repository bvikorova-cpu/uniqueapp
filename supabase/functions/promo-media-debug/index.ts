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
  const url = new URL(req.url);
  const folder = url.searchParams.get("f") ?? "";
  const out: Record<string, unknown> = {};
  if (url.searchParams.get("write")) {
    const up = await supabase.storage.from("promotions").upload(
      `debug/probe-${Date.now()}.txt`,
      new Blob(["probe"], { type: "text/plain" }),
      { upsert: true },
    );
    out.upload = { data: up.data, error: up.error?.message };
    const back = await supabase.storage.from("promotions").list("debug", { limit: 10 });
    out.listDebug = { data: back.data, error: back.error?.message };
  }
  const { data, error } = await supabase.storage.from("promotions").list(folder, { limit: 100 });
  out.list = { data, error: error?.message };
  return new Response(JSON.stringify(out), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
