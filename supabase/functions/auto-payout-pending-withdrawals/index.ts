// Scheduled job: auto-pays small pending creator withdrawals via Stripe Connect
// transfers. Designed to be triggered by pg_cron weekly. Only auto-pays rows
// that satisfy ALL of:
//   - status = 'pending'
//   - amount <= AUTO_PAYOUT_MAX_EUR (default 200 EUR)
//   - creator has stripe_connect_payouts_enabled = true
// Bigger amounts stay pending for manual admin review.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (s: string, d?: unknown) =>
  console.log(`[AUTO-PAYOUT] ${s}${d ? " - " + JSON.stringify(d) : ""}`);

const KIND_MAP = {
  instructor: { table: "instructor_withdrawal_requests", creatorCol: "instructor_id", transferCol: "stripe_transfer_id" },
  musician:   { table: "musician_withdrawal_requests",   creatorCol: "musician_id",   transferCol: "stripe_transfer_id" },
  masterchef: { table: "masterchef_withdrawal_requests", creatorCol: "chef_id",       transferCol: "stripe_transfer_id" },
  influencer: { table: "influencer_withdrawal_requests", creatorCol: "influencer_id", transferCol: "stripe_transfer_id" },
  auction:    { table: "auction_withdrawal_requests",    creatorCol: "seller_id",     transferCol: "stripe_payout_id"   },
  referral:   { table: "referral_withdrawal_requests",   creatorCol: "referrer_id",   transferCol: "stripe_transfer_id" },
  campaign:   { table: "withdrawal_requests",            creatorCol: "user_id",       transferCol: "stripe_transfer_id" },
} as const;

const AUTO_MAX_EUR = Number(Deno.env.get("AUTO_PAYOUT_MAX_EUR") ?? "200");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const results: any[] = [];
  let totalPaid = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    log("starting auto-payout sweep", { maxEur: AUTO_MAX_EUR });

    for (const [kind, cfg] of Object.entries(KIND_MAP)) {
      const { data: rows, error } = await admin
        .from(cfg.table)
        .select("*")
        .eq("status", "pending")
        .lte("amount", AUTO_MAX_EUR)
        .limit(100);
      if (error) {
        log(`fetch failed for ${kind}`, { err: error.message });
        continue;
      }
      if (!rows?.length) continue;

      log(`${kind}: ${rows.length} pending candidates`);

      for (const wd of rows) {
        const creatorId = (wd as any)[cfg.creatorCol];
        if (!creatorId) {
          totalSkipped++;
          continue;
        }
        const { data: profile } = await admin
          .from("profiles")
          .select("stripe_connect_account_id, stripe_connect_payouts_enabled")
          .eq("id", creatorId)
          .maybeSingle();

        if (!profile?.stripe_connect_account_id || !profile.stripe_connect_payouts_enabled) {
          totalSkipped++;
          continue;
        }

        const amountCents = Math.round(Number(wd.amount) * 100);
        if (!Number.isFinite(amountCents) || amountCents <= 0) {
          totalSkipped++;
          continue;
        }

        try {
          // ATOMIC CLAIM: pending -> processing. Skip if another sweep grabbed it.
          const { data: claimed, error: claimErr } = await admin
            .from(cfg.table)
            .update({ status: "processing" })
            .eq("id", wd.id)
            .eq("status", "pending")
            .select("id");
          if (claimErr) throw claimErr;
          if (!claimed || claimed.length === 0) {
            totalSkipped++;
            continue;
          }

          const transfer = await stripe.transfers.create({
            amount: amountCents,
            currency: "eur",
            destination: profile.stripe_connect_account_id,
            description: `auto ${kind} withdrawal ${wd.id}`,
            metadata: { kind, withdrawal_id: wd.id, creator_id: creatorId, auto: "true" },
          }, {
            idempotencyKey: `auto-payout-${kind}-${wd.id}`,
          });

          const updateData: Record<string, unknown> = {
            status: "completed",
            admin_notes: "Auto-paid by scheduled job",
            processed_at: new Date().toISOString(),
            [cfg.transferCol]: transfer.id,
          };
          await admin.from(cfg.table).update(updateData).eq("id", wd.id);

          // For referral kind, mark earnings as paid FIFO up to the withdrawn amount
          if (kind === "referral") {
            const { data: unpaid } = await admin
              .from("megatalent_referral_earnings")
              .select("id, amount")
              .eq("referrer_id", creatorId)
              .eq("paid", false)
              .order("created_at", { ascending: true });
            let remaining = Number(wd.amount);
            const idsToMark: string[] = [];
            for (const row of unpaid || []) {
              if (remaining <= 0) break;
              idsToMark.push(row.id);
              remaining -= Number(row.amount);
            }
            if (idsToMark.length > 0) {
              await admin
                .from("megatalent_referral_earnings")
                .update({ paid: true })
                .in("id", idsToMark);
            }
          }

          await admin.from("admin_audit_log").insert({
            admin_id: "00000000-0000-0000-0000-000000000000",
            action: "withdrawal_auto_paid",
            target_id: wd.id,
            target_type: cfg.table,
            details: { kind, amount: wd.amount, transfer_id: transfer.id },
          });

          totalPaid++;
          results.push({ kind, id: wd.id, transfer_id: transfer.id, amount: wd.amount });
        } catch (e) {
          totalFailed++;
          const msg = e instanceof Error ? e.message : String(e);
          log(`transfer failed for ${kind}/${wd.id}`, { msg });
          results.push({ kind, id: wd.id, error: msg });
        }
      }
    }

    log("sweep complete", { paid: totalPaid, skipped: totalSkipped, failed: totalFailed });

    return new Response(
      JSON.stringify({
        success: true,
        paid: totalPaid,
        skipped: totalSkipped,
        failed: totalFailed,
        details: results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log("FATAL", { msg });
    return new Response(JSON.stringify({ error: msg, paid: totalPaid, failed: totalFailed }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
