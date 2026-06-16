// Admin engagement metrics — DAU/MAU/WAU + daily time series
// Calls SQL functions get_engagement_metrics + get_dau_series (admin-only).
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { days = 30 } = await req.json().catch(() => ({}));
    const safeDays = Math.min(Math.max(parseInt(String(days), 10) || 30, 1), 365);

    const [{ data: metrics, error: mErr }, { data: series, error: sErr }] = await Promise.all([
      supabase.rpc("get_engagement_metrics", { p_days: safeDays }),
      supabase.rpc("get_dau_series", { p_days: safeDays }),
    ]);

    if (mErr) throw mErr;
    if (sErr) throw sErr;

    return new Response(JSON.stringify({ metrics, series }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg.includes("Forbidden") ? 403 : 500;
    return new Response(JSON.stringify({ error: msg }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
