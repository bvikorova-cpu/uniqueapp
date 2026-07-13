import postgres from "npm:postgres@3.4.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const JOB_NAMES = [
  "weekly-xp-snapshot",
  "daily-security-scan-edge",
  "daily-security-scan-deps",
  "daily-stripe-reconciliation",
  "rotate-seasonal-missions-daily",
  "evaluate-xp-bets-hourly",
  "rotate-mystery-events-monthly",
  "coupon-price-alerts-hourly",
  "best-friend-daily-checkin",
  "auto-payout-weekly",
  "weekly-iq-tournament",
  "finalize-iq-tournaments",
  "fundraising-dunning-daily",
  "deactivate-expired-job-listings",
  "expire-job-listings-daily",
  "health-monitor-5min",
  "monthly-credits-grant",
  "mt-escrow-auto-release",
  "mt-stories-cleanup",
  "brand-escrow-auto-release",
  "cleanup-log-tables-daily",
  "grant-monthly-free-credits",
  "award-eco-monthly-winner",
  "award-healthy-monthly-winner",
];

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const body = await req.json().catch(() => ({}));
  if (body?.confirm !== "pause-cron-jobs-for-auth-recovery") {
    return json({ error: "Missing recovery confirmation" }, 400);
  }

  const dbUrl = Deno.env.get("SUPABASE_DB_URL");
  if (!dbUrl) return json({ error: "SUPABASE_DB_URL is not configured" }, 500);

  const sql = postgres(dbUrl, {
    max: 1,
    connect_timeout: 8,
    idle_timeout: 1,
    prepare: false,
  });

  const results: Array<{ job: string; ok: boolean; error?: string }> = [];
  try {
    await sql`set statement_timeout = '8s'`;
    for (const job of JOB_NAMES) {
      try {
        await sql`select cron.unschedule(${job})`;
        results.push({ job, ok: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        results.push({ job, ok: false, error: message.slice(0, 240) });
      }
    }

    const activity = await sql`
      select usename, application_name, state, count(*)::int as count
      from pg_stat_activity
      group by usename, application_name, state
      order by count desc
      limit 20
    `;

    return json({ ok: true, results, activity });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return json({ ok: false, error: message }, 500);
  } finally {
    await sql.end({ timeout: 1 }).catch(() => undefined);
  }
});