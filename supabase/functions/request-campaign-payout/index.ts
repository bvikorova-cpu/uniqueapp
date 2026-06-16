// Campaign owner withdraws available funds to their Stripe Connect account
// via a Stripe transfer (platform balance → connected account).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ALLOWED_TYPES = new Set([
  "medical", "dream", "hero", "pet", "student", "crisis", "talent",
]);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json({ error: "STRIPE_SECRET_KEY missing" }, 500);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Authorization required" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data: u, error: uErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (uErr || !u.user) return json({ error: "Authentication failed" }, 401);
    const user = u.user;

    let body: { campaign_type?: string; campaign_id?: string; amount_cents?: number } = {};
    try { body = await req.json(); } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    const campaign_type = String(body.campaign_type || "").toLowerCase();
    const campaign_id = String(body.campaign_id || "");
    const amount_cents = Number(body.amount_cents || 0);

    if (!ALLOWED_TYPES.has(campaign_type)) return json({ error: "Invalid campaign_type" }, 400);
    if (!/^[0-9a-f-]{36}$/i.test(campaign_id)) return json({ error: "Invalid campaign_id" }, 400);
    if (!Number.isInteger(amount_cents) || amount_cents <= 0) {
      return json({ error: "amount_cents must be a positive integer" }, 400);
    }
    // Minimum payout 1 EUR to avoid Stripe minimum issues / dust.
    if (amount_cents < 100) return json({ error: "Minimum payout is €1.00" }, 400);

    // 1. Verify ownership
    const { data: ownerCheck, error: ownerErr } = await supabase.rpc(
      "is_campaign_owner",
      { _user_id: user.id, _campaign_type: campaign_type, _campaign_id: campaign_id },
    );
    if (ownerErr) {
      console.error("is_campaign_owner failed", ownerErr);
      return json({ error: "Ownership check failed" }, 500);
    }
    if (!ownerCheck) return json({ error: "You do not own this campaign" }, 403);

    // 2. Verify Connect account is ready
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_connect_account_id, stripe_connect_payouts_enabled")
      .eq("id", user.id)
      .maybeSingle();

    const connectAccount = profile?.stripe_connect_account_id;
    if (!connectAccount) {
      return json({
        error: "No Stripe Connect account. Please complete onboarding first.",
        code: "NO_CONNECT_ACCOUNT",
      }, 400);
    }
    if (!profile?.stripe_connect_payouts_enabled) {
      return json({
        error: "Payouts not yet enabled on your Stripe account. Finish onboarding.",
        code: "PAYOUTS_DISABLED",
      }, 400);
    }

    // 2b. Block if there's already an in-flight payout (race-condition guard)
    const { data: inFlight, error: inFlightErr } = await supabase
      .from("campaign_payouts")
      .select("id, status")
      .eq("campaign_id", campaign_id)
      .eq("campaign_type", campaign_type)
      .in("status", ["pending", "pending_review", "processing"])
      .limit(1);
    if (inFlightErr) {
      console.error("in-flight check failed", inFlightErr);
      return json({ error: "Payout state check failed" }, 500);
    }
    if (inFlight && inFlight.length > 0) {
      return json({
        error: "A payout request is already in progress for this campaign. Wait until it completes or is reviewed.",
        code: "PAYOUT_IN_FLIGHT",
      }, 409);
    }

    // 3. Verify available balance covers requested amount
    const { data: bal, error: balErr } = await supabase.rpc(
      "get_campaign_available_balance",
      { _campaign_type: campaign_type, _campaign_id: campaign_id },
    );
    if (balErr) {
      console.error("balance rpc failed", balErr);
      return json({ error: "Balance lookup failed" }, 500);
    }
    const available = Number(bal?.[0]?.available_cents ?? 0);
    if (amount_cents > available) {
      return json({
        error: `Requested amount exceeds available balance (€${(available/100).toFixed(2)})`,
        code: "INSUFFICIENT_BALANCE",
        available_cents: available,
      }, 400);
    }

    // 4. Decide if payout requires manual admin review (Plan B + D + safety net)
    const { data: reviewDecision, error: reviewErr } = await supabase.rpc(
      "payout_requires_review",
      {
        _campaign_type: campaign_type,
        _campaign_id: campaign_id,
        _amount_cents: amount_cents,
      },
    );
    if (reviewErr) {
      console.error("payout_requires_review failed", reviewErr);
      return json({ error: "Review decision failed" }, 500);
    }
    const decision = (reviewDecision as any)?.[0] || { needs_review: false, reason: null };
    const needsReview: boolean = !!decision.needs_review;
    const reviewReason: string | null = decision.reason ?? null;

    // 5. Insert audit row (status reflects whether review is needed)
    const { data: payoutRow, error: insErr } = await supabase
      .from("campaign_payouts")
      .insert({
        campaign_id,
        campaign_type,
        owner_user_id: user.id,
        amount_cents,
        currency: "eur",
        stripe_destination_account: connectAccount,
        status: needsReview ? "pending_review" : "pending",
        requires_review: needsReview,
        review_reason: reviewReason,
      })
      .select("id")
      .single();
    if (insErr || !payoutRow) {
      console.error("payout insert failed", insErr);
      return json({ error: "Could not record payout" }, 500);
    }

    // 6a. If review is required → STOP here, admin will approve later.
    if (needsReview) {
      await supabase.from("notifications").insert({
        user_id: user.id,
        type: "campaign_payout_pending_review",
        title: "Payout request submitted for approval",
        message: `Your payout request of €${(amount_cents / 100).toFixed(2)} is awaiting admin approval.${reviewReason ? ` Review reason: ${reviewReason}` : ""}`,
        related_id: payoutRow.id,
      });
      return json({
        success: true,
        status: "pending_review",
        payout_id: payoutRow.id,
        amount_cents,
        currency: "eur",
        review_reason: reviewReason,
        message: "Your withdrawal request is awaiting admin approval. You will be notified once reviewed.",
      });
    }

    // 6b. Auto-approved path: create Stripe transfer immediately.
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    try {
      const transfer = await stripe.transfers.create({
        amount: amount_cents,
        currency: "eur",
        destination: connectAccount,
        description: `Campaign payout — ${campaign_type}/${campaign_id}`,
        metadata: {
          campaign_type,
          campaign_id,
          payout_row_id: payoutRow.id,
          owner_user_id: user.id,
        },
      });

      await supabase
        .from("campaign_payouts")
        .update({
          status: "completed",
          stripe_transfer_id: transfer.id,
          completed_at: new Date().toISOString(),
        })
        .eq("id", payoutRow.id);

      await supabase.from("notifications").insert({
        user_id: user.id,
        type: "campaign_payout_completed",
        title: "Payout successfully sent",
        message: `€${(amount_cents / 100).toFixed(2)} has been transferred to your Stripe account.`,
        related_id: payoutRow.id,
      });

      return json({
        success: true,
        status: "completed",
        transfer_id: transfer.id,
        amount_cents,
        currency: "eur",
        payout_id: payoutRow.id,
      });
    } catch (stripeErr) {
      const msg = stripeErr instanceof Error ? stripeErr.message : String(stripeErr);
      console.error("[stripe.transfers.create]", msg);
      await supabase
        .from("campaign_payouts")
        .update({ status: "failed", failure_reason: msg })
        .eq("id", payoutRow.id);
      return json({ error: msg, code: "STRIPE_TRANSFER_FAILED" }, 502);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[request-campaign-payout]", msg);
    return json({ error: msg }, 500);
  }
});
