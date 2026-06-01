import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MONTHLY_AMOUNT = 10;
const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 100; // throttle between batches
const MAX_RUNTIME_MS = 50_000; // edge function timeout safety (Supabase ~60s)

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const startedAt = Date.now();
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  // parse optional body { grantMonth?: "YYYY-MM-01", dryRun?: boolean }
  let bodyOpts: { grantMonth?: string; dryRun?: boolean } = {};
  try {
    if (req.method === "POST") bodyOpts = await req.json().catch(() => ({}));
  } catch { /* ignore */ }

  const now = new Date();
  const grantMonth = bodyOpts.grantMonth ??
    `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
  const dryRun = !!bodyOpts.dryRun;

  let granted = 0;
  let skipped = 0;
  let failed = 0;
  let processed = 0;
  const failures: Array<{ user_id: string; stage: string; error: string }> = [];

  console.log(`[monthly-credits-grant] start grantMonth=${grantMonth} dryRun=${dryRun}`);

  const processUser = async (userId: string) => {
    processed++;
    try {
      // 1) insert log row — UNIQUE(user_id, grant_month) guarantees idempotency
      const { error: logErr } = await supabase
        .from("monthly_credit_grants")
        .insert({ user_id: userId, grant_month: grantMonth, credits_granted: MONTHLY_AMOUNT });

      if (logErr) {
        // 23505 = unique_violation => already granted this month, expected skip
        const code = (logErr as any).code;
        if (code === "23505") {
          skipped++;
          return;
        }
        failed++;
        failures.push({ user_id: userId, stage: "log_insert", error: logErr.message });
        console.error(`[monthly-credits-grant] log insert failed user=${userId}`, logErr);
        return;
      }

      if (dryRun) {
        granted++;
        // rollback the log to keep dry-run side-effect-free
        await supabase
          .from("monthly_credit_grants")
          .delete()
          .eq("user_id", userId)
          .eq("grant_month", grantMonth);
        return;
      }

      // 2) credit the user
      const { data: row, error: selErr } = await supabase
        .from("ai_credits")
        .select("id, credits_remaining")
        .eq("user_id", userId)
        .maybeSingle();

      if (selErr) {
        failed++;
        failures.push({ user_id: userId, stage: "credits_select", error: selErr.message });
        console.error(`[monthly-credits-grant] select failed user=${userId}`, selErr);
        return;
      }

      if (row) {
        const { error: updErr } = await supabase
          .from("ai_credits")
          .update({
            credits_remaining: (row.credits_remaining ?? 0) + MONTHLY_AMOUNT,
            updated_at: new Date().toISOString(),
          })
          .eq("id", row.id);
        if (updErr) {
          failed++;
          failures.push({ user_id: userId, stage: "credits_update", error: updErr.message });
          console.error(`[monthly-credits-grant] update failed user=${userId}`, updErr);
          // compensating action: remove the log row so a retry can re-grant
          await supabase.from("monthly_credit_grants").delete()
            .eq("user_id", userId).eq("grant_month", grantMonth);
          return;
        }
      } else {
        const { error: insErr } = await supabase.from("ai_credits").insert({
          user_id: userId,
          credits_remaining: MONTHLY_AMOUNT,
          total_credits_purchased: 0,
        });
        if (insErr) {
          failed++;
          failures.push({ user_id: userId, stage: "credits_insert", error: insErr.message });
          console.error(`[monthly-credits-grant] insert failed user=${userId}`, insErr);
          await supabase.from("monthly_credit_grants").delete()
            .eq("user_id", userId).eq("grant_month", grantMonth);
          return;
        }
      }
      granted++;
    } catch (e: any) {
      failed++;
      failures.push({ user_id: userId, stage: "exception", error: String(e?.message ?? e) });
      console.error(`[monthly-credits-grant] exception user=${userId}`, e);
    }
  };

  let page = 1;
  const perPage = 1000;
  let timedOut = false;

  outer: while (true) {
    const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ page, perPage });
    if (listErr) {
      console.error("[monthly-credits-grant] listUsers failed", listErr);
      return new Response(
        JSON.stringify({ ok: false, error: listErr.message, processed, granted, skipped, failed, failures }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    const users = list?.users ?? [];
    if (users.length === 0) break;

    // process in batches with throttling + timeout guard
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      if (Date.now() - startedAt > MAX_RUNTIME_MS) {
        timedOut = true;
        console.warn(`[monthly-credits-grant] runtime limit reached, stopping at page=${page} offset=${i}`);
        break outer;
      }
      const batch = users.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map((u) => processUser(u.id)));
      if (i + BATCH_SIZE < users.length) await sleep(BATCH_DELAY_MS);
    }

    if (users.length < perPage) break;
    page++;
  }

  const elapsedMs = Date.now() - startedAt;
  console.log(
    `[monthly-credits-grant] done grantMonth=${grantMonth} processed=${processed} granted=${granted} skipped=${skipped} failed=${failed} elapsedMs=${elapsedMs} timedOut=${timedOut}`
  );

  // best-effort failure notification log row
  if (failed > 0) {
    await supabase.from("monthly_credit_grant_failures").insert({
      grant_month: grantMonth,
      failure_count: failed,
      details: failures.slice(0, 100),
    }).then(({ error }) => {
      if (error) console.error("[monthly-credits-grant] failure log insert error", error);
    });
  }

  return new Response(
    JSON.stringify({
      ok: failed === 0,
      grantMonth,
      processed,
      granted,
      skipped,
      failed,
      timedOut,
      elapsedMs,
      failures: failures.slice(0, 50),
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
  );
});
