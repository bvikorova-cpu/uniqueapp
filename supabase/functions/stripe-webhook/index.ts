// Universal Stripe webhook listener.
// Listens for: payment_intent.succeeded, charge.refunded, charge.dispute.created,
// checkout.session.completed, transfer.created. Keeps `payment_records` ledger
// in sync with Stripe's source of truth. Idempotent — safe to retry.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const log = (step: string, details?: unknown) => {
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? " " + JSON.stringify(details) : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    log("missing config");
    return new Response("Missing Stripe config", { status: 500 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

  // Verify signature
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    log("signature verification failed", { err: (err as Error).message });
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }
  log("event received", { type: event.type, id: event.id });

  try {
    switch (event.type) {
      // ─── PAYMENT SUCCEEDED ───────────────────────────────────────────
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const { error } = await supabase
          .from("payment_records")
          .update({
            status: "paid",
            verified_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", pi.id)
          .neq("status", "refunded");
        if (error) log("update paid failed", { error: error.message });
        break;
      }

      // ─── CHECKOUT COMPLETED (fallback if frontend verify never fires) ─
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status === "paid") {
          const { error } = await supabase
            .from("payment_records")
            .update({
              status: "paid",
              stripe_payment_intent_id: session.payment_intent as string,
              stripe_customer_id:
                typeof session.customer === "string" ? session.customer : null,
              verified_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_session_id", session.id)
            .neq("status", "refunded");
          if (error) log("checkout sync failed", { error: error.message });
        }
        break;
      }

      // ─── REFUND (manual via Stripe dashboard or admin button) ────────
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const piId =
          typeof charge.payment_intent === "string" ? charge.payment_intent : null;
        if (!piId) break;
        const refundAmount = charge.amount_refunded ?? 0;
        const lastRefund = charge.refunds?.data?.[0];

        const { error } = await supabase
          .from("payment_records")
          .update({
            status: "refunded",
            refunded_at: new Date().toISOString(),
            refund_amount_cents: refundAmount,
            stripe_refund_id: lastRefund?.id ?? null,
            refund_reason: lastRefund?.reason ?? "stripe_dashboard",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", piId);
        if (error) log("refund sync failed", { error: error.message });
        break;
      }

      // ─── DISPUTE LIFECYCLE (chargeback) ──────────────────────────────
      case "charge.dispute.created":
      case "charge.dispute.updated":
      case "charge.dispute.closed":
      case "charge.dispute.funds_withdrawn":
      case "charge.dispute.funds_reinstated": {
        const dispute = event.data.object as Stripe.Dispute;
        const piId =
          typeof dispute.payment_intent === "string" ? dispute.payment_intent : null;
        const chargeId =
          typeof dispute.charge === "string" ? dispute.charge : null;

        // Find linked payment_record
        let paymentRecordId: string | null = null;
        if (piId) {
          const { data: pr } = await supabase
            .from("payment_records")
            .select("id")
            .eq("stripe_payment_intent_id", piId)
            .maybeSingle();
          paymentRecordId = pr?.id ?? null;
        }

        const resolution =
          dispute.status === "won"
            ? "won"
            : dispute.status === "lost"
              ? "lost"
              : dispute.status === "warning_closed"
                ? "warning_closed"
                : null;

        // Upsert into stripe_disputes
        const { error: dispErr } = await supabase
          .from("stripe_disputes")
          .upsert(
            {
              stripe_dispute_id: dispute.id,
              stripe_payment_intent_id: piId,
              stripe_charge_id: chargeId,
              payment_record_id: paymentRecordId,
              amount_cents: dispute.amount,
              currency: dispute.currency,
              reason: dispute.reason,
              status: dispute.status,
              evidence_due_by: dispute.evidence_details?.due_by
                ? new Date(dispute.evidence_details.due_by * 1000).toISOString()
                : null,
              evidence: (dispute.evidence as any) ?? {},
              is_charge_refundable: dispute.is_charge_refundable ?? true,
              resolved_at: resolution ? new Date().toISOString() : null,
              resolution,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "stripe_dispute_id" },
          );
        if (dispErr) log("dispute upsert failed", { error: dispErr.message });

        // Mark payment as disputed (only on first event)
        if (event.type === "charge.dispute.created" && piId) {
          await supabase
            .from("payment_records")
            .update({
              status: "disputed",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_payment_intent_id", piId);

          await supabase.from("admin_audit_log").insert({
            admin_id: "00000000-0000-0000-0000-000000000000",
            action: "stripe_dispute_opened",
            target_type: "payment_records",
            target_id: piId,
            details: {
              dispute_id: dispute.id,
              reason: dispute.reason,
              amount: dispute.amount,
            },
          });
        }
        break;
      }

      // ─── SUBSCRIPTION ACTIVATED → credit referrer €5 (one-shot) ──────
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        if (sub.status !== "active" && sub.status !== "trialing") break;

        // Resolve buyer's user_id via customer email → profiles
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
        if (!customerId) break;
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted) break;
        const email = (customer as Stripe.Customer).email;
        if (!email) break;

        const { data: buyerProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", email)
          .maybeSingle();
        if (!buyerProfile?.id) {
          log("referral skip: no profile for email", { email });
          break;
        }

        // Find attribution row
        const { data: attr } = await supabase
          .from("referral_attributions")
          .select("id, referrer_id, rewarded_at")
          .eq("referred_user_id", buyerProfile.id)
          .maybeSingle();
        if (!attr || attr.rewarded_at) break; // no referrer or already rewarded

        // Insert €5 earning (unique index on referrer_id + source_subscription_id)
        const periodStart = new Date().toISOString();
        const periodEnd = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
        const { error: earnErr } = await supabase
          .from("megatalent_referral_earnings")
          .insert({
            referrer_id: attr.referrer_id,
            referred_user_id: buyerProfile.id,
            amount: 5,
            paid: false,
            period_start: periodStart,
            period_end: periodEnd,
            source_subscription_id: sub.id,
            auto_credited: true,
          });
        if (earnErr) {
          // Likely duplicate (unique violation) — already credited, just mark attribution
          log("referral earning insert skipped", { error: earnErr.message });
        }

        await supabase
          .from("referral_attributions")
          .update({
            rewarded_at: new Date().toISOString(),
            first_subscription_id: sub.id,
          })
          .eq("id", attr.id);

        await supabase.from("admin_audit_log").insert({
          admin_id: "00000000-0000-0000-0000-000000000000",
          action: "referral_reward_credited",
          target_type: "megatalent_referral_earnings",
          target_id: attr.referrer_id,
          details: {
            referrer_id: attr.referrer_id,
            referred_user_id: buyerProfile.id,
            subscription_id: sub.id,
            amount_eur: 5,
          },
        });
        log("referral reward credited", { referrer: attr.referrer_id, sub: sub.id });
        break;
      }

      // ─── TRANSFER (Connect payout to creator confirmed) ──────────────
      case "transfer.created": {
        const transfer = event.data.object as Stripe.Transfer;
        log("transfer confirmed", { id: transfer.id, dest: transfer.destination });
        // Already recorded by admin-payout-withdrawal; nothing to do.
        break;
      }

      default:
        log("ignored event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log("handler error", { msg });
    // Return 200 anyway so Stripe doesn't retry forever on logic bugs.
    return new Response(JSON.stringify({ received: true, error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
