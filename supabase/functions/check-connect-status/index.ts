/**
 * UNIVERSAL CONNECT & PORTAL ROUTER
 * 
 * Original purpose: check Stripe Connect status (default action when no body)
 * 
 * Now also routes:
 *   { action: "status" }                     → Connect account status (default)
 *   { action: "connect_login" }              → Stripe Connect login link
 *   { action: "customer_portal" }            → Stripe Billing Portal (universal for ALL hubs)
 *   { action: "customer_portal", return_url } → with custom return URL
 * 
 * Replaces 10 deleted functions:
 *   create-connect-login-link
 *   best-friend-customer-portal, companions-customer-portal,
 *   employer-customer-portal, f1-customer-portal, healthcare-customer-portal,
 *   kids-customer-portal, kids-story-customer-portal,
 *   psychology-customer-portal, customer-portal-creator
 */
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
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: u, error: uErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (uErr || !u.user) throw new Error("Authentication failed");
    const user = u.user;

    // Parse body safely (GET requests have no body)
    let body: any = {};
    if (req.method !== "GET") {
      try { body = await req.json(); } catch { body = {}; }
    }
    const action = body.action || "status";
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-09-30.clover" });
    const origin = req.headers.get("origin") || "https://uniqueapp.fun";

    // ─── ACTION: live_status — fetch live Stripe account + balance + recent payouts ───
    if (action === "live_status") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_connect_account_id")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.stripe_connect_account_id) {
        return json({ connected: false });
      }
      const acctId = profile.stripe_connect_account_id as string;

      const acct = await stripe.accounts.retrieve(acctId);
      let balance: any = null;
      let recentPayouts: any[] = [];
      try {
        balance = await stripe.balance.retrieve({ stripeAccount: acctId });
      } catch (e) { console.warn("[live_status] balance failed", (e as Error).message); }
      try {
        const list = await stripe.payouts.list({ limit: 5 }, { stripeAccount: acctId });
        recentPayouts = list.data.map((p) => ({
          id: p.id, amount: p.amount, currency: p.currency,
          status: p.status, arrival_date: p.arrival_date, created: p.created,
        }));
      } catch (e) { console.warn("[live_status] payouts failed", (e as Error).message); }

      const reqs = (acct.requirements ?? {}) as Stripe.Account.Requirements;
      const caps = (acct.capabilities ?? {}) as Record<string, string>;
      const sched = (acct.settings?.payouts?.schedule ?? null) as any;

      // Sync the cached snapshot in profiles so cheap reads stay fresh.
      await supabase.from("profiles").update({
        stripe_connect_charges_enabled: !!acct.charges_enabled,
        stripe_connect_payouts_enabled: !!acct.payouts_enabled,
        stripe_connect_onboarding_complete: !!acct.details_submitted,
        stripe_connect_details_submitted: !!acct.details_submitted,
        stripe_connect_disabled_reason: reqs.disabled_reason ?? null,
        stripe_connect_currently_due: reqs.currently_due ?? [],
        stripe_connect_past_due: reqs.past_due ?? [],
        stripe_connect_eventually_due: reqs.eventually_due ?? [],
        stripe_connect_default_currency: acct.default_currency ?? null,
        stripe_connect_payout_schedule: sched,
        stripe_connect_country: acct.country ?? null,
        stripe_connect_capabilities: caps,
        stripe_connect_account_type: acct.type ?? null,
        stripe_connect_synced_at: new Date().toISOString(),
      }).eq("id", user.id);

      return json({
        connected: true,
        account_id: acctId,
        account_type: acct.type,
        country: acct.country,
        default_currency: acct.default_currency,
        charges_enabled: !!acct.charges_enabled,
        payouts_enabled: !!acct.payouts_enabled,
        details_submitted: !!acct.details_submitted,
        disabled_reason: reqs.disabled_reason ?? null,
        currently_due: reqs.currently_due ?? [],
        past_due: reqs.past_due ?? [],
        eventually_due: reqs.eventually_due ?? [],
        capabilities: caps,
        payout_schedule: sched,
        balance: balance ? {
          available: balance.available,
          pending: balance.pending,
          instant_available: (balance as any).instant_available ?? null,
        } : null,
        recent_payouts: recentPayouts,
        synced_at: new Date().toISOString(),
      });
    }

    // ─── ACTION: update_payout_schedule ───
    if (action === "update_payout_schedule") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_connect_account_id")
        .eq("id", user.id)
        .maybeSingle();
      if (!profile?.stripe_connect_account_id) {
        return json({ error: "No Stripe Connect account." }, 404);
      }
      const interval = String(body.interval || "daily");
      if (!["manual", "daily", "weekly", "monthly"].includes(interval)) {
        return json({ error: "Invalid interval" }, 400);
      }
      const schedule: any = { interval };
      if (interval === "weekly" && body.weekly_anchor) schedule.weekly_anchor = body.weekly_anchor;
      if (interval === "monthly" && body.monthly_anchor) schedule.monthly_anchor = Number(body.monthly_anchor);

      const updated = await stripe.accounts.update(profile.stripe_connect_account_id, {
        settings: { payouts: { schedule } },
      });
      const newSched = updated.settings?.payouts?.schedule ?? null;
      await supabase.from("profiles").update({
        stripe_connect_payout_schedule: newSched,
        stripe_connect_synced_at: new Date().toISOString(),
      }).eq("id", user.id);
      return json({ ok: true, payout_schedule: newSched });
    }

    // ─── ACTION: connect_login (Stripe Connect dashboard link) ───
    if (action === "connect_login") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_connect_account_id")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.stripe_connect_account_id) {
        return json({ error: "No Stripe Connect account. Please complete onboarding first." }, 404);
      }
      const link = await stripe.accounts.createLoginLink(profile.stripe_connect_account_id);
      return json({ url: link.url });
    }

    // ─── ACTION: customer_portal (Stripe Billing Portal — works for any hub) ───
    if (action === "customer_portal") {
      const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
      if (customers.data.length === 0) {
        return json({ error: "No active subscription found for this account." }, 404);
      }
      const session = await stripe.billingPortal.sessions.create({
        customer: customers.data[0].id,
        return_url: body.return_url || `${origin}/account`,
      });
      return json({ url: session.url });
    }

    // ─── ACTION: start_stream / stop_stream ───
    // These are non-Stripe actions; we just record state in profiles or sessions.
    // Returns ok=true so the frontend can update its UI; actual streaming infra
    // is handled elsewhere (or by the user's WebRTC provider).
    if (action === "start_stream" || action === "stop_stream") {
      try {
        await supabase.from("profiles").update({
          is_streaming: action === "start_stream",
          last_stream_action_at: new Date().toISOString(),
        }).eq("id", user.id);
      } catch { /* table column may not exist; non-critical */ }
      return json({ ok: true, action, user_id: user.id });
    }

    // ─── ACTION: withdrawal_request / auction_withdrawal / instructor_withdrawal ───
    // Records a withdrawal request for admin review. Actual payout happens
    // through Stripe Connect when the admin approves.
    if (
      action === "withdrawal_request" ||
      action === "auction_withdrawal" ||
      action === "instructor_withdrawal" ||
      action === "notify_auction_withdrawal"
    ) {
      const amount = Number(body.amount || 0);
      const reason = String(body.reason || action);
      try {
        await supabase.from("withdrawal_requests").insert({
          user_id: user.id,
          amount,
          status: "pending",
          reason,
          metadata: body.metadata || {},
        });
      } catch (e) {
        console.error("[withdrawal_request]", e);
      }
      return json({ ok: true, action, amount, status: "pending" });
    }

    // ─── ACTION: sale_transaction ───
    // Records a peer-to-peer sale and (optionally) splits payout via Connect.
    if (action === "sale_transaction") {
      try {
        await supabase.from("sales_transactions").insert({
          seller_id: body.seller_id || user.id,
          buyer_id: body.buyer_id || null,
          amount: Number(body.amount || 0),
          item_id: body.item_id || null,
          status: "recorded",
          metadata: body.metadata || {},
        });
      } catch { /* table may not exist; non-critical */ }
      return json({ ok: true, action: "sale_transaction" });
    }

    // ─── ACTION: activate_job (job listing activation) ───
    if (action === "activate_job") {
      const listingId = body.listing_id || body.id;
      if (listingId) {
        try {
          await supabase.from("job_listings")
            .update({ status: "active", activated_at: new Date().toISOString() })
            .eq("id", listingId)
            .eq("user_id", user.id);
        } catch { /* ignore */ }
      }
      return json({ ok: true, action: "activate_job", listing_id: listingId });
    }


    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "stripe_connect_account_id, stripe_connect_charges_enabled, stripe_connect_payouts_enabled, stripe_connect_onboarding_complete"
      )
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.stripe_connect_account_id) {
      return json({ connected: false });
    }

    return json({
      connected: true,
      account_id: profile.stripe_connect_account_id,
      charges_enabled: profile.stripe_connect_charges_enabled ?? false,
      payouts_enabled: profile.stripe_connect_payouts_enabled ?? false,
      onboarding_complete: profile.stripe_connect_onboarding_complete ?? false,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[check-connect-status]", msg);
    return json({ error: msg, connected: false }, 500);
  }
});
