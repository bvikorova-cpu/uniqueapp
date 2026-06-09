// Konsolidovaný Stripe Connect payout pre kreátorov (Earnings + InstantPayoutButton).
// - Server-side balance check (get_creator_available_cents)
// - Race-condition guard (žiadny iný pending/processing payout)
// - Audit log do public.creator_payouts
// - Podporuje method = 'standard' | 'instant' (1% fee pre instant)
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const INSTANT_FEE_BPS = 100; // 1.00 %
const MIN_STANDARD_CENTS = 100;   // €1
const MIN_INSTANT_CENTS = 1000;   // €10

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

    let body: { amount_cents?: number; currency?: string; method?: string } = {};
    try { body = await req.json(); } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    const amount_cents = Number(body.amount_cents || 0);
    const currency = String(body.currency || "eur").toLowerCase();
    const method = (body.method === "instant" ? "instant" : "standard") as "standard" | "instant";

    if (!Number.isInteger(amount_cents) || amount_cents <= 0) {
      return json({ error: "amount_cents must be a positive integer" }, 400);
    }
    const minCents = method === "instant" ? MIN_INSTANT_CENTS : MIN_STANDARD_CENTS;
    if (amount_cents < minCents) {
      return json({
        error: `Minimum ${method} payout is €${(minCents / 100).toFixed(2)}`,
        code: "BELOW_MINIMUM",
      }, 400);
    }

    // 1. Connect onboarding check
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_connect_account_id, stripe_connect_payouts_enabled")
      .eq("id", user.id)
      .maybeSingle();

    const connectAccount = profile?.stripe_connect_account_id;
    if (!connectAccount) {
      return json({
        error: "No Stripe Connect account. Complete onboarding first.",
        code: "NO_CONNECT_ACCOUNT",
      }, 400);
    }
    if (!profile?.stripe_connect_payouts_enabled) {
      return json({
        error: "Payouts not yet enabled on your Stripe account.",
        code: "PAYOUTS_DISABLED",
      }, 400);
    }

    // 2. Race guard
    const { data: inFlight, error: ifErr } = await supabase
      .from("creator_payouts")
      .select("id, status")
      .eq("user_id", user.id)
      .in("status", ["pending", "processing"])
      .limit(1);
    if (ifErr) {
      console.error("[stripe-connect-payout] in-flight check failed", ifErr);
      return json({ error: "Payout state check failed" }, 500);
    }
    if (inFlight && inFlight.length > 0) {
      return json({
        error: "A payout is already in progress. Wait until it completes.",
        code: "PAYOUT_IN_FLIGHT",
      }, 409);
    }

    // 3. Compute fee + gross required
    const fee_cents = method === "instant"
      ? Math.ceil((amount_cents * INSTANT_FEE_BPS) / 10_000)
      : 0;
    const totalRequired = amount_cents + fee_cents;

    // 4. Server-side balance check
    const { data: bal, error: balErr } = await supabase.rpc(
      "get_creator_available_cents",
      { _user_id: user.id },
    );
    if (balErr) {
      console.error("[stripe-connect-payout] balance rpc failed", balErr);
      return json({ error: "Balance lookup failed" }, 500);
    }
    const available = Number(bal ?? 0);
    if (totalRequired > available) {
      return json({
        error: `Requested amount + fee (€${(totalRequired / 100).toFixed(2)}) exceeds available balance (€${(available / 100).toFixed(2)})`,
        code: "INSUFFICIENT_BALANCE",
        available_cents: available,
      }, 400);
    }

    // 5. Insert pending audit row
    const { data: payoutRow, error: insErr } = await supabase
      .from("creator_payouts")
      .insert({
        user_id: user.id,
        amount_cents,
        fee_cents,
        currency,
        method,
        status: "pending",
        stripe_connect_account_id: connectAccount,
      })
      .select("id")
      .single();
    if (insErr || !payoutRow) {
      console.error("[stripe-connect-payout] insert failed", insErr);
      return json({ error: "Failed to record payout" }, 500);
    }

    // 6. Call Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    try {
      const payout = await stripe.payouts.create(
        {
          amount: amount_cents,
          currency,
          method: method === "instant" ? "instant" : "standard",
          metadata: {
            creator_payout_id: payoutRow.id,
            user_id: user.id,
          },
        },
        { stripeAccount: connectAccount },
      );

      await supabase
        .from("creator_payouts")
        .update({
          status: "processing",
          stripe_payout_id: payout.id,
        })
        .eq("id", payoutRow.id);

      return json({
        payout_id: payout.id,
        amount: payout.amount,
        fee_cents,
        currency: payout.currency,
        method,
        arrival_date: payout.arrival_date,
        status: payout.status,
        creator_payout_id: payoutRow.id,
      });
    } catch (stripeErr) {
      const msg = stripeErr instanceof Error ? stripeErr.message : String(stripeErr);
      await supabase
        .from("creator_payouts")
        .update({ status: "failed", error_message: msg })
        .eq("id", payoutRow.id);
      console.error("[stripe-connect-payout] Stripe error", msg);
      return json({ error: msg, code: "STRIPE_ERROR" }, 502);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[stripe-connect-payout]", msg);
    return json({ error: msg }, 500);
  }
});
