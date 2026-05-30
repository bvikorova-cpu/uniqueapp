// Daily reconciliation: compare Stripe charges with payment_records ledger.
// Body: { date?: string (YYYY-MM-DD, default = yesterday UTC) }
// Returns counts + arrays of mismatches (missing in DB, missing in Stripe,
// status/amount differences). Admin-only.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const log = (s: string, d?: unknown) =>
  console.log(`[RECONCILE] ${s}${d ? " - " + JSON.stringify(d) : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Early auth pre-check (returns 401 instead of crashing inside try → 500)
  const _earlyAuth = req.headers.get("Authorization");
  if (!_earlyAuth || !_earlyAuth.toLowerCase().startsWith("bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const isCron = body?.source === "cron";
    let adminUserId: string | null = null;

    // Auth + admin check (skipped for cron-triggered runs)
    if (!isCron) {
      const auth = req.headers.get("Authorization");
      if (!auth) throw new Error("No auth header");
      const { data: u } = await admin.auth.getUser(auth.replace("Bearer ", ""));
      if (!u.user) throw new Error("Not authenticated");
      const { data: roles } = await admin
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user.id);
      if (!roles?.some((r: any) => r.role === "admin")) {
        return new Response(JSON.stringify({ error: "Admin only" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        });
      }
      adminUserId = u.user.id;
    }

    const t0 = Date.now();
    const dateStr: string =
      body.date ||
      new Date(Date.now() - 24 * 3600 * 1000).toISOString().slice(0, 10);
    const start = new Date(`${dateStr}T00:00:00Z`);
    const end = new Date(start.getTime() + 24 * 3600 * 1000);
    log("range", { start: start.toISOString(), end: end.toISOString() });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // 1. List all Stripe charges for the day (paginated)
    const charges: Stripe.Charge[] = [];
    let starting_after: string | undefined;
    for (let i = 0; i < 20; i++) {
      const page = await stripe.charges.list({
        created: {
          gte: Math.floor(start.getTime() / 1000),
          lt: Math.floor(end.getTime() / 1000),
        },
        limit: 100,
        starting_after,
      });
      charges.push(...page.data);
      if (!page.has_more) break;
      starting_after = page.data[page.data.length - 1]?.id;
    }
    log("stripe charges", { count: charges.length });

    // 2. Load payment_records for the same window
    const { data: records, error: recErr } = await admin
      .from("payment_records")
      .select("id, stripe_payment_intent_id, amount, currency, status, created_at")
      .gte("created_at", start.toISOString())
      .lt("created_at", end.toISOString());
    if (recErr) throw recErr;
    log("db records", { count: records?.length ?? 0 });

    const byPi = new Map<string, any>();
    for (const r of records ?? []) {
      if (r.stripe_payment_intent_id) byPi.set(r.stripe_payment_intent_id, r);
    }

    const missingInDb: any[] = [];
    const amountMismatch: any[] = [];
    const statusMismatch: any[] = [];

    for (const ch of charges) {
      const piId = typeof ch.payment_intent === "string"
        ? ch.payment_intent
        : ch.payment_intent?.id;
      if (!piId) continue;
      const rec = byPi.get(piId);
      if (!rec) {
        missingInDb.push({
          charge_id: ch.id,
          payment_intent: piId,
          amount: ch.amount,
          currency: ch.currency,
          status: ch.status,
          created: new Date(ch.created * 1000).toISOString(),
        });
        continue;
      }
      // amount stored as integer cents in payment_records
      if (Math.round(Number(rec.amount)) !== ch.amount) {
        amountMismatch.push({
          payment_record_id: rec.id,
          payment_intent: piId,
          db_amount: rec.amount,
          stripe_amount: ch.amount,
        });
      }
      const expectedStatus = ch.refunded
        ? "refunded"
        : ch.disputed
        ? "disputed"
        : ch.status === "succeeded"
        ? "paid"
        : ch.status;
      if (rec.status !== expectedStatus) {
        statusMismatch.push({
          payment_record_id: rec.id,
          payment_intent: piId,
          db_status: rec.status,
          stripe_status: expectedStatus,
        });
      }
    }

    const stripePiSet = new Set(
      charges
        .map((c) => (typeof c.payment_intent === "string" ? c.payment_intent : c.payment_intent?.id))
        .filter(Boolean) as string[],
    );
    const missingInStripe = (records ?? [])
      .filter(
        (r) =>
          r.stripe_payment_intent_id &&
          !stripePiSet.has(r.stripe_payment_intent_id) &&
          r.status === "paid",
      )
      .map((r) => ({
        payment_record_id: r.id,
        payment_intent: r.stripe_payment_intent_id,
        amount: r.amount,
        status: r.status,
      }));

    const summary = {
      stripe_charges: charges.length,
      db_records: records?.length ?? 0,
      missing_in_db: missingInDb.length,
      missing_in_stripe: missingInStripe.length,
      amount_mismatch: amountMismatch.length,
      status_mismatch: statusMismatch.length,
    };

    // Persist run history
    await admin.from("reconciliation_runs").insert({
      run_date: dateStr,
      trigger_source: isCron ? "cron" : "manual",
      ...summary,
      details: { missingInDb, missingInStripe, amountMismatch, statusMismatch },
      duration_ms: Date.now() - t0,
    });

    // Audit log (only for manual admin runs)
    if (adminUserId) {
      await admin.from("admin_audit_log").insert({
        admin_id: adminUserId,
        action: "reconcile_run",
        target_type: "payment_records",
        details: { date: dateStr, ...summary },
      });
    }

    return new Response(
      JSON.stringify({
        date: dateStr,
        summary: {
          stripe_charges: charges.length,
          db_records: records?.length ?? 0,
          missing_in_db: missingInDb.length,
          missing_in_stripe: missingInStripe.length,
          amount_mismatch: amountMismatch.length,
          status_mismatch: statusMismatch.length,
        },
        missing_in_db: missingInDb,
        missing_in_stripe: missingInStripe,
        amount_mismatch: amountMismatch,
        status_mismatch: statusMismatch,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
