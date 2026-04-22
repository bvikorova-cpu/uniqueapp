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

      // ─── DISPUTE OPENED (chargeback) ─────────────────────────────────
      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        const piId =
          typeof dispute.payment_intent === "string" ? dispute.payment_intent : null;
        if (!piId) break;

        // Mark payment as disputed (separate status — does NOT auto-refund)
        await supabase
          .from("payment_records")
          .update({
            status: "disputed",
            updated_at: new Date().toISOString(),
            metadata: {
              dispute_id: dispute.id,
              dispute_reason: dispute.reason,
              dispute_amount: dispute.amount,
              dispute_status: dispute.status,
            },
          })
          .eq("stripe_payment_intent_id", piId);

        // Audit log so admins notice
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
