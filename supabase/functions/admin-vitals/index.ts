// Admin-only Web Vitals reporting:
// - per-metric p50/p75/p95 + good% over the window
// - daily p75 series for one metric (default LCP)
// Auth is enforced inside the SQL functions via has_role().
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );

    const { days = 7, metric = "LCP", route = null } = await req.json().catch(() => ({}));
    const safeDays = Math.min(Math.max(parseInt(String(days), 10) || 7, 1), 90);
    const safeMetric = ["LCP", "CLS", "INP", "FCP", "TTFB"].includes(metric) ? metric : "LCP";

    const [{ data: summary, error: e1 }, { data: daily, error: e2 }] = await Promise.all([
      supabase.rpc("get_vitals_summary", { p_days: safeDays, p_route: route }),
      supabase.rpc("get_vitals_daily",   { p_days: safeDays, p_metric: safeMetric }),
    ]);
    if (e1) throw e1;
    if (e2) throw e2;

    return new Response(JSON.stringify({ summary, daily, days: safeDays, metric: safeMetric }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg.toLowerCase().includes("forbidden") || msg.includes("permission") ? 403 : 500;
    return new Response(JSON.stringify({ error: msg }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
