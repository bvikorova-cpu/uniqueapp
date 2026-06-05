// M1+M2: Auto-release / auto-refund stale Megatalent escrow.
// - marketplace orders: status='paid' AND delivery_due_at < now() - 3 days → release 80/20.
// - mentorship bookings: status='paid' AND scheduled_at < now() - 24h → release 80/20.
// - mentorship bookings: status='pending' AND created_at < now() - 72h → cancel (no Stripe action; checkout never completed).
//
// Called daily by pg_cron. Gated by x-cron-secret header (CRON_SECRET env).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const SELLER_PCT = 80;
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const cronSecret = Deno.env.get("CRON_SECRET");
    if (cronSecret && req.headers.get("x-cron-secret") !== cronSecret) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: cors });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", { apiVersion: "2025-08-27.basil" });
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const results = { marketplace_released: 0, mentorship_released: 0, mentorship_cancelled: 0, errors: [] as string[] };

    const releaseRow = async (kind: "marketplace" | "mentorship", row: any) => {
      try {
        if (row.stripe_transfer_id) return;
        let sellerUserId: string;
        if (kind === "mentorship") {
          const { data: mentor } = await admin.from("mt_mentors").select("user_id").eq("id", row.mentor_id).maybeSingle();
          if (!mentor?.user_id) throw new Error("mentor profile missing");
          sellerUserId = mentor.user_id;
        } else {
          sellerUserId = row.seller_id;
        }
        const { data: profile } = await admin
          .from("profiles")
          .select("stripe_connect_account_id, stripe_connect_payouts_enabled")
          .eq("id", sellerUserId)
          .maybeSingle();
        if (!profile?.stripe_connect_account_id || !profile.stripe_connect_payouts_enabled) {
          throw new Error(`seller ${sellerUserId} not Connect-enabled`);
        }
        const gross = Number(row.price_cents);
        const sellerCents = Math.floor((gross * SELLER_PCT) / 100);
        const transfer = await stripe.transfers.create(
          {
            amount: sellerCents,
            currency: "eur",
            destination: profile.stripe_connect_account_id,
            description: `MT ${kind} ${row.id} (auto 80%)`,
            metadata: { mt_kind: kind, mt_row_id: row.id, auto: "1" },
          },
          { idempotencyKey: `mt-auto-release-${kind}-${row.id}` },
        );
        const now = new Date().toISOString();
        const upd: Record<string, unknown> = { status: "completed", stripe_transfer_id: transfer.id, completed_at: now };
        if (kind === "marketplace") upd.delivered_at = now;
        await admin.from(kind === "mentorship" ? "mt_mentorship_bookings" : "mt_marketplace_orders").update(upd).eq("id", row.id);
        if (kind === "mentorship") results.mentorship_released++;
        else results.marketplace_released++;
      } catch (e) {
        results.errors.push(`${kind}/${row.id}: ${e instanceof Error ? e.message : String(e)}`);
      }
    };

    // Marketplace: paid + delivery_due_at older than 3 days
    const marketCutoff = new Date(Date.now() - 3 * 86400_000).toISOString();
    const { data: mkRows } = await admin
      .from("mt_marketplace_orders")
      .select("*")
      .eq("status", "paid")
      .is("stripe_transfer_id", null)
      .lt("delivery_due_at", marketCutoff)
      .limit(100);
    for (const r of mkRows ?? []) await releaseRow("marketplace", r);

    // Mentorship: paid + scheduled_at older than 24h
    const mentCutoff = new Date(Date.now() - 86400_000).toISOString();
    const { data: mentRows } = await admin
      .from("mt_mentorship_bookings")
      .select("*")
      .eq("status", "paid")
      .is("stripe_transfer_id", null)
      .lt("scheduled_at", mentCutoff)
      .limit(100);
    for (const r of mentRows ?? []) await releaseRow("mentorship", r);

    // Mentorship: pending > 72h → cancel (no money to refund; payment_intent was never captured)
    const pendCutoff = new Date(Date.now() - 3 * 86400_000).toISOString();
    const { data: cancelled, error: cErr } = await admin
      .from("mt_mentorship_bookings")
      .update({ status: "cancelled" })
      .eq("status", "pending")
      .lt("created_at", pendCutoff)
      .select("id");
    if (cErr) results.errors.push(`cancel pending: ${cErr.message}`);
    else results.mentorship_cancelled = cancelled?.length ?? 0;

    return new Response(JSON.stringify({ success: true, ...results }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[mt-escrow-auto-release]", msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
