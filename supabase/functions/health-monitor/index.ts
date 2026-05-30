// Production health monitor.
// Triggered by pg_cron every 5 minutes. Calls /health-check, persists the result
// to health_check_log, and POSTs to HEALTH_ALERT_WEBHOOK_URL (Slack/Discord-compatible)
// on failure with a 30-minute cooldown to avoid alert spam.
//
// Manual trigger:  POST /functions/v1/health-monitor  body: {"source":"manual"}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALERT_COOLDOWN_MIN = 30;

import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const base = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const webhookUrl = Deno.env.get("HEALTH_ALERT_WEBHOOK_URL") ?? "";

  const admin = createClient(base, serviceKey, { auth: { persistSession: false } });
  const body = await req.json().catch(() => ({}));
  const source = String(body?.source ?? "manual");

  // 1. Probe health-check
  let ok = false;
  let statusCode = 0;
  let payload: any = {};
  try {
    const r = await fetch(`${base}/functions/v1/health-check`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    });
    statusCode = r.status;
    payload = await r.json().catch(() => ({}));
    ok = r.ok && payload?.ok === true;
  } catch (e: any) {
    payload = { error: e?.message ?? "fetch failed" };
  }

  // 2. Persist log row
  let alerted = false;
  let logId: string | null = null;
  try {
    const { data } = await admin
      .from("health_check_log")
      .insert({ ok, status_code: statusCode, response: payload, source })
      .select("id")
      .single();
    logId = data?.id ?? null;
  } catch (e) {
    console.error("health log insert failed", e);
  }

  // 3. Alert on failure with cooldown
  if (!ok && webhookUrl) {
    const since = new Date(Date.now() - ALERT_COOLDOWN_MIN * 60_000).toISOString();
    const { data: recent } = await admin
      .from("health_check_log")
      .select("id")
      .eq("alerted", true)
      .gte("created_at", since)
      .limit(1);

    if (!recent || recent.length === 0) {
      const broken = (payload?.checks ?? [])
        .filter((c: any) => !c.ok)
        .map((c: any) => `${c.name} (status ${c.status ?? "?"}${c.missing_actions?.length ? `, missing: ${c.missing_actions.join(",")}` : ""})`)
        .join(", ") || "health-check unreachable";

      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Slack-compatible. Discord also accepts `{content}` so we send both.
          body: JSON.stringify({
            text: `🚨 Unique health-check FAILED: ${broken}`,
            content: `🚨 Unique health-check FAILED: ${broken}`,
          }),
        });
        if (logId) await admin.from("health_check_log").update({ alerted: true }).eq("id", logId);
        alerted = true;
      } catch (e) {
        console.error("webhook alert failed", e);
      }
    }
  }

  return new Response(JSON.stringify({ ok, statusCode, alerted, source, logId }), {
    status: ok ? 200 : 503,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
