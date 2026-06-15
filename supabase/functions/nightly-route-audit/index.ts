// Nightly route audit: fetches each public route via HTTP, checks for 200 + non-empty HTML.
// This is a server-side smoke check — it won't catch client-side JS errors but catches:
// - Routes that 404 / 500
// - Routes whose HTML shell fails to serve
// - SSR/edge problems
//
// Triggered nightly by pg_cron.
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PUBLIC_BASE = Deno.env.get("PUBLIC_BASE_URL") ?? "https://uniqueapp.lovable.app";

// Curated list of critical public routes (full list of 448 is in src/utils/smokeTestRoutes.json).
// Server-side HTTP check is only meaningful for the SPA shell; we focus on top-level entry points.
const CRITICAL_ROUTES = [
  "/", "/auth", "/about", "/about-platform",
  "/dating", "/community", "/musicians", "/marketplace",
  "/megatalent", "/games", "/kids-channel", "/fundraising",
  "/credits", "/pricing", "/privacy", "/terms",
  "/masterchef", "/masterclass", "/brand-arena",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  const { data: run, error: runErr } = await supabase
    .from("smoke_test_runs")
    .insert({ run_type: "nightly", total_routes: CRITICAL_ROUTES.length, notes: `base=${PUBLIC_BASE}` })
    .select()
    .single();
  if (runErr) {
    return new Response(JSON.stringify({ error: runErr.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  let pass = 0, fail = 0;
  for (const route of CRITICAL_ROUTES) {
    const start = Date.now();
    let status: "pass" | "fail" = "fail";
    let httpStatus = 0;
    const errors: string[] = [];
    try {
      const res = await fetch(`${PUBLIC_BASE}${route}`, { redirect: "follow" });
      httpStatus = res.status;
      const html = await res.text();
      if (res.ok && html.includes('id="root"') && html.length > 200) {
        status = "pass"; pass++;
      } else {
        errors.push(`HTTP ${res.status}, html len ${html.length}`);
        fail++;
      }
    } catch (e) {
      errors.push(String((e as Error).message));
      fail++;
    }
    await supabase.from("smoke_test_route_results").insert({
      run_id: run.id, route, status, http_status: httpStatus,
      console_errors: errors, duration_ms: Date.now() - start,
    });
  }

  await supabase
    .from("smoke_test_runs")
    .update({ finished_at: new Date().toISOString(), passed: pass, failed: fail })
    .eq("id", run.id);

  return new Response(JSON.stringify({ run_id: run.id, pass, fail }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
