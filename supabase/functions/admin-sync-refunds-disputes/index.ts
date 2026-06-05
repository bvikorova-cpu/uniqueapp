// S4: Refund & Dispute Reconciliation
// Polls Stripe for refunds & disputes from the last N days (default 14) and
// back-syncs payment_records + stripe_disputes for anything the webhook missed.
// Body: { days?: number, source?: 'cron' | 'manual' }
// Admin-only unless source='cron'. Idempotent: only writes when DB drifts.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
const log = (s: string, d?: unknown) =>
  console.log(`[SYNC-REF-DSP] ${s}${d ? " - " + JSON.stringify(d) : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

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

    if (!isCron) {
      const auth = req.headers.get("Authorization");
      if (!auth) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: u } = await admin.auth.getUser(auth.replace("Bearer ", ""));
      if (!u.user) throw new Error("Not authenticated");
      const { data: roles } = await admin
        .from("user_roles").select("role").eq("user_id", u.user.id);
      if (!roles?.some((r: any) => r.role === "admin")) {
        return new Response(JSON.stringify({ error: "Admin only" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const days = Math.min(Math.max(Number(body.days ?? 14), 1), 90);
    const since = Math.floor((Date.now() - days * 24 * 3600 * 1000) / 1000);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const t0 = Date.now();
    let refundsSynced = 0, disputesSynced = 0, refundsChecked = 0, disputesChecked = 0;
    const errors: any[] = [];

    // ---- 1) Refunds ----
    let starting_after: string | undefined;
    for (let i = 0; i < 30; i++) {
      const page = await stripe.refunds.list({
        created: { gte: since }, limit: 100, starting_after,
      });
      for (const rf of page.data) {
        refundsChecked++;
        const piId = typeof rf.payment_intent === "string"
          ? rf.payment_intent : rf.payment_intent?.id;
        if (!piId) continue;
        const { data: rec } = await admin
          .from("payment_records")
          .select("id, status, refund_amount_cents, stripe_refund_id")
          .eq("stripe_payment_intent_id", piId)
          .maybeSingle();
        if (!rec) continue;
        const needsUpdate =
          rec.status !== "refunded" ||
          rec.stripe_refund_id !== rf.id ||
          (rec.refund_amount_cents ?? 0) !== rf.amount;
        if (!needsUpdate) continue;
        const { error } = await admin
          .from("payment_records")
          .update({
            status: "refunded",
            refunded_at: new Date(rf.created * 1000).toISOString(),
            refund_amount_cents: rf.amount,
            stripe_refund_id: rf.id,
            refund_reason: rf.reason ?? null,
          })
          .eq("id", rec.id);
        if (error) errors.push({ kind: "refund", id: rf.id, error: error.message });
        else refundsSynced++;
      }
      if (!page.has_more) break;
      starting_after = page.data[page.data.length - 1]?.id;
    }
    log("refunds", { refundsChecked, refundsSynced });

    // ---- 2) Disputes ----
    starting_after = undefined;
    for (let i = 0; i < 30; i++) {
      const page = await stripe.disputes.list({
        created: { gte: since }, limit: 100, starting_after,
      });
      for (const dp of page.data) {
        disputesChecked++;
        const piId = typeof dp.payment_intent === "string"
          ? dp.payment_intent : dp.payment_intent?.id;
        const chId = typeof dp.charge === "string" ? dp.charge : dp.charge?.id;

        const { data: pr } = piId
          ? await admin.from("payment_records")
              .select("id").eq("stripe_payment_intent_id", piId).maybeSingle()
          : { data: null as any };

        // Upsert stripe_disputes
        const row = {
          stripe_dispute_id: dp.id,
          stripe_payment_intent_id: piId ?? null,
          stripe_charge_id: chId ?? null,
          payment_record_id: pr?.id ?? null,
          amount_cents: dp.amount,
          currency: dp.currency,
          reason: dp.reason,
          status: dp.status,
          evidence_due_by: dp.evidence_details?.due_by
            ? new Date(dp.evidence_details.due_by * 1000).toISOString() : null,
          is_charge_refundable: dp.is_charge_refundable ?? null,
          resolved_at: ["won", "lost", "warning_closed"].includes(dp.status)
            ? new Date().toISOString() : null,
          resolution: ["won", "lost"].includes(dp.status) ? dp.status : null,
        };
        const { error: upErr } = await admin
          .from("stripe_disputes")
          .upsert(row, { onConflict: "stripe_dispute_id" });
        if (upErr) { errors.push({ kind: "dispute", id: dp.id, error: upErr.message }); continue; }

        // Mirror disputed status on the ledger
        if (pr?.id) {
          await admin.from("payment_records")
            .update({ status: "disputed" })
            .eq("id", pr.id)
            .neq("status", "refunded");
        }
        disputesSynced++;
      }
      if (!page.has_more) break;
      starting_after = page.data[page.data.length - 1]?.id;
    }
    log("disputes", { disputesChecked, disputesSynced });

    const summary = {
      days, refundsChecked, refundsSynced, disputesChecked, disputesSynced,
      errors: errors.length, duration_ms: Date.now() - t0,
    };
    log("done", summary);

    return new Response(JSON.stringify({ ok: true, ...summary, errors }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
