// Batch 16+17 — check-router consolidates subscription/credit + dunning/SCA + Stripe Connect checks:
//   action: "lottery"                   ← check-lottery-subscription
//   action: "phobia"                    ← check-phobia-subscription
//   action: "tipster"                   ← check-tipster-subscription
//   action: "megatalent_sub"            ← check-megatalent-subscription
//   action: "megatalent_vip"            ← check-megatalent-vip
//   action: "anonymous_date_access"     ← check-anonymous-date-access
//   action: "dunning"                   ← check-dunning
//   action: "sca"                       ← check-sca (soft auth, DB-only)
//   action: "connect_status" (default)  ← check-connect-status (Stripe Connect)
//   action: "live_status"               ← check-connect-status live Stripe sync
//   action: "connect_login"             ← Stripe Connect dashboard login link
//   action: "customer_portal"           ← Stripe Billing Portal (universal)
//   action: "update_payout_schedule"    ← Stripe Connect payout schedule
//   action: "start_stream"/"stop_stream"
//   action: "withdrawal_request" / "auction_withdrawal" / "instructor_withdrawal" / "notify_auction_withdrawal"
//   action: "sale_transaction"
//   action: "activate_job"
// Routed via src/integrations/supabase/proxyMap.ts.
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

const LOTTERY_PRODUCTS = {
  basic: "prod_TQinlyjGo50cTk",
  pro: "prod_TQinw9pUYC81T8",
};
const TIPSTER_PRODUCT_ID = "prod_TQkgfkhRhpZSXw";
const MT_PRICE_TO_TIER: Record<string, "premium" | "top_premium"> = {
  price_1TOvuRGaXSfGtYFt6sfpt2Dy: "premium",
  price_1TOvuTGaXSfGtYFtIheCgIzQ: "top_premium",
};
const MT_TIER_PRICE: Record<string, number> = { premium: 10, top_premium: 15 };

function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );
}

function stripeClient(apiVersion: "2025-08-27.basil" | "2025-09-30.clover" = "2025-08-27.basil") {
  return new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", { apiVersion });
}

async function getUser(req: Request) {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const sb = admin();
  const { data, error } = await sb.auth.getUser(auth.replace("Bearer ", ""));
  if (error || !data.user?.email) return null;
  return data.user;
}

function periodEndIso(sub: any): string | null {
  const v = sub?.current_period_end;
  if (typeof v !== "number" || !isFinite(v)) return null;
  return new Date(v * 1000).toISOString();
}

const safeTsToIso = (ts: number | null | undefined): string | null => {
  if (!ts || typeof ts !== "number") return null;
  try { return new Date(ts * 1000).toISOString(); } catch { return null; }
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let body: any = {};
  if (req.method !== "GET") {
    try { body = await req.json(); } catch { body = {}; }
  }
  const action = String(body?.action ?? "connect_status");

  // ─── SCA: soft auth, DB-only ───
  if (action === "sca") {
    try {
      const sb = admin();
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return json({ has_pending: false, unauthenticated: true });
      }
      const { data: userData, error: userErr } = await sb.auth.getUser(authHeader.replace("Bearer ", ""));
      if (userErr || !userData.user?.email) {
        return json({ has_pending: false, auth_unavailable: true });
      }
      const user = userData.user;
      const { data: pendingRows, error: pendingErr } = await sb
        .from("sca_pending_actions")
        .select("stripe_invoice_id, amount_cents, currency, hosted_invoice_url, next_action_url")
        .eq("user_id", user.id)
        .eq("status", "requires_action")
        .limit(1);
      if (pendingErr) return json({ has_pending: false, check_unavailable: true });
      if (!pendingRows || pendingRows.length === 0) return json({ has_pending: false });
      const p = pendingRows[0];
      return json({
        has_pending: true,
        pending: {
          invoice_id: p.stripe_invoice_id,
          amount_cents: p.amount_cents,
          currency: p.currency,
          hosted_invoice_url: p.hosted_invoice_url,
          next_action_url: p.next_action_url,
        },
      });
    } catch (e) {
      console.error("[check-router:sca]", e instanceof Error ? e.message : e);
      return json({ has_pending: false, check_unavailable: true });
    }
  }

  // ─── DUNNING: soft 200 on error ───
  if (action === "dunning") {
    try {
      const sb = admin();
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) return json({ error: "No auth header", has_dunning: false });
      const { data: userData, error: userErr } = await sb.auth.getUser(authHeader.replace("Bearer ", ""));
      if (userErr || !userData.user) return json({ error: "Auth failed", has_dunning: false });
      const user = userData.user;
      const { data: rows, error } = await sb
        .from("dunning_events")
        .select("*")
        .eq("user_id", user.id)
        .in("kind", ["failed", "requires_action"])
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) throw error;
      const dunning = rows?.[0] ?? null;
      let stillPastDue = !!dunning;
      if (dunning?.stripe_subscription_id) {
        try {
          const stripe = stripeClient();
          const sub = await stripe.subscriptions.retrieve(dunning.stripe_subscription_id);
          stillPastDue = ["past_due", "unpaid", "incomplete"].includes(sub.status);
        } catch (_e) { /* keep DB state */ }
      }
      return json({ has_dunning: stillPastDue, dunning: stillPastDue ? dunning : null });
    } catch (e) {
      return json({ error: e instanceof Error ? e.message : String(e), has_dunning: false });
    }
  }

  // ─── All other actions require authenticated user ───
  try {
    const user = await getUser(req);
    if (!user) return json({ error: "Unauthorized" }, 401);

    const stripe = stripeClient();
    const sb = admin();

    // ─── ANONYMOUS DATE ACCESS ───
    if (action === "anonymous_date_access") {
      const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
      if (customers.data.length === 0) {
        return json({ hasAccess: false, subscriptionEnd: null });
      }
      const customerId = customers.data[0].id;
      const subs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 });
      const hasActive = subs.data.length > 0;
      let subscriptionEnd: string | null = null;
      let stripeSubscriptionId: string | null = null;
      if (hasActive) {
        const s = subs.data[0];
        subscriptionEnd = safeTsToIso(s.current_period_end);
        stripeSubscriptionId = s.id;
        const periodStart = safeTsToIso(s.current_period_start);
        const { data: existing } = await sb
          .from("anonymous_dating_subscriptions")
          .select("*").eq("user_id", user.id).single();
        if (existing) {
          await sb.from("anonymous_dating_subscriptions").update({
            stripe_customer_id: customerId,
            stripe_subscription_id: stripeSubscriptionId,
            subscription_status: "active",
            current_period_start: periodStart,
            current_period_end: subscriptionEnd,
            updated_at: new Date().toISOString(),
          }).eq("user_id", user.id);
        } else {
          await sb.from("anonymous_dating_subscriptions").insert({
            user_id: user.id,
            stripe_customer_id: customerId,
            stripe_subscription_id: stripeSubscriptionId,
            subscription_status: "active",
            current_period_start: periodStart,
            current_period_end: subscriptionEnd,
          });
        }
      } else {
        await sb.from("anonymous_dating_subscriptions").update({
          subscription_status: "inactive",
          updated_at: new Date().toISOString(),
        }).eq("user_id", user.id);
      }
      return json({ hasAccess: hasActive, subscriptionEnd });
    }

    // ─── CONNECT-STATUS group: use clover API ───
    const connectActions = new Set([
      "connect_status", "status", "live_status", "connect_login", "customer_portal",
      "update_payout_schedule", "start_stream", "stop_stream",
      "withdrawal_request", "auction_withdrawal", "instructor_withdrawal", "notify_auction_withdrawal",
      "sale_transaction", "activate_job",
    ]);

    if (connectActions.has(action)) {
      const stripeC = stripeClient("2025-09-30.clover");
      const origin = req.headers.get("origin") || "https://uniqueapp.fun";

      if (action === "live_status") {
        const { data: profile } = await sb
          .from("profiles").select("stripe_connect_account_id").eq("id", user.id).maybeSingle();
        if (!profile?.stripe_connect_account_id) return json({ connected: false });
        const acctId = profile.stripe_connect_account_id as string;
        const acct = await stripeC.accounts.retrieve(acctId);
        let balance: any = null;
        let recentPayouts: any[] = [];
        try { balance = await stripeC.balance.retrieve({ stripeAccount: acctId }); } catch (e) { console.warn("[live_status] balance failed", (e as Error).message); }
        try {
          const list = await stripeC.payouts.list({ limit: 5 }, { stripeAccount: acctId });
          recentPayouts = list.data.map((p) => ({
            id: p.id, amount: p.amount, currency: p.currency,
            status: p.status, arrival_date: p.arrival_date, created: p.created,
          }));
        } catch (e) { console.warn("[live_status] payouts failed", (e as Error).message); }
        const reqs = (acct.requirements ?? {}) as Stripe.Account.Requirements;
        const caps = (acct.capabilities ?? {}) as Record<string, string>;
        const sched = (acct.settings?.payouts?.schedule ?? null) as any;
        await sb.from("profiles").update({
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

      if (action === "update_payout_schedule") {
        const { data: profile } = await sb
          .from("profiles").select("stripe_connect_account_id").eq("id", user.id).maybeSingle();
        if (!profile?.stripe_connect_account_id) return json({ error: "No Stripe Connect account." }, 404);
        const interval = String(body.interval || "daily");
        if (!["manual", "daily", "weekly", "monthly"].includes(interval)) return json({ error: "Invalid interval" }, 400);
        const schedule: any = { interval };
        if (interval === "weekly" && body.weekly_anchor) schedule.weekly_anchor = body.weekly_anchor;
        if (interval === "monthly" && body.monthly_anchor) schedule.monthly_anchor = Number(body.monthly_anchor);
        const updated = await stripeC.accounts.update(profile.stripe_connect_account_id, {
          settings: { payouts: { schedule } },
        });
        const newSched = updated.settings?.payouts?.schedule ?? null;
        await sb.from("profiles").update({
          stripe_connect_payout_schedule: newSched,
          stripe_connect_synced_at: new Date().toISOString(),
        }).eq("id", user.id);
        return json({ ok: true, payout_schedule: newSched });
      }

      if (action === "connect_login") {
        const { data: profile } = await sb
          .from("profiles").select("stripe_connect_account_id").eq("id", user.id).maybeSingle();
        if (!profile?.stripe_connect_account_id) {
          return json({ error: "No Stripe Connect account. Please complete onboarding first." }, 404);
        }
        const link = await stripeC.accounts.createLoginLink(profile.stripe_connect_account_id);
        return json({ url: link.url });
      }

      if (action === "customer_portal") {
        const customers = await stripeC.customers.list({ email: user.email!, limit: 1 });
        if (customers.data.length === 0) return json({ error: "No active subscription found for this account." }, 404);
        const session = await stripeC.billingPortal.sessions.create({
          customer: customers.data[0].id,
          return_url: body.return_url || `${origin}/account`,
        });
        return json({ url: session.url });
      }

      if (action === "start_stream" || action === "stop_stream") {
        try {
          await sb.from("profiles").update({
            is_streaming: action === "start_stream",
            last_stream_action_at: new Date().toISOString(),
          }).eq("id", user.id);
        } catch { /* non-critical */ }
        return json({ ok: true, action, user_id: user.id });
      }

      if (action === "withdrawal_request" || action === "auction_withdrawal" ||
          action === "instructor_withdrawal" || action === "notify_auction_withdrawal") {
        const amount = Number(body.amount || 0);
        const reason = String(body.reason || action);
        try {
          await sb.from("withdrawal_requests").insert({
            user_id: user.id, amount, status: "pending", reason, metadata: body.metadata || {},
          });
        } catch (e) { console.error("[withdrawal_request]", e); }
        return json({ ok: true, action, amount, status: "pending" });
      }

      if (action === "sale_transaction") {
        try {
          await sb.from("sales_transactions").insert({
            seller_id: body.seller_id || user.id,
            buyer_id: body.buyer_id || null,
            amount: Number(body.amount || 0),
            item_id: body.item_id || null,
            status: "recorded",
            metadata: body.metadata || {},
          });
        } catch { /* non-critical */ }
        return json({ ok: true, action: "sale_transaction" });
      }

      if (action === "activate_job") {
        const listingId = body.listing_id || body.id;
        if (listingId) {
          try {
            await sb.from("job_listings")
              .update({ status: "active", activated_at: new Date().toISOString() })
              .eq("id", listingId).eq("user_id", user.id);
          } catch { /* ignore */ }
        }
        return json({ ok: true, action: "activate_job", listing_id: listingId });
      }

      // Default connect_status / status
      const { data: profile } = await sb
        .from("profiles")
        .select(
          "stripe_connect_account_id, stripe_connect_charges_enabled, stripe_connect_payouts_enabled, stripe_connect_onboarding_complete",
        )
        .eq("id", user.id).maybeSingle();
      if (!profile?.stripe_connect_account_id) return json({ connected: false });
      return json({
        connected: true,
        account_id: profile.stripe_connect_account_id,
        charges_enabled: profile.stripe_connect_charges_enabled ?? false,
        payouts_enabled: profile.stripe_connect_payouts_enabled ?? false,
        onboarding_complete: profile.stripe_connect_onboarding_complete ?? false,
      });
    }

    // ─── Subscription/credit checks (Batch 16) ───
    if (action === "lottery") {
      const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
      if (customers.data.length === 0) {
        return json({ subscribed: false, isBasic: false, isPro: false, subscription_end: null, product_id: null });
      }
      const subs = await stripe.subscriptions.list({ customer: customers.data[0].id, status: "active", limit: 10 });
      let isBasic = false, isPro = false, subscriptionEnd: string | null = null, productId: string | null = null;
      for (const s of subs.data) {
        const pid = s.items.data[0].price.product as string;
        subscriptionEnd = periodEndIso(s);
        if (pid === LOTTERY_PRODUCTS.basic) { isBasic = true; productId = pid; }
        else if (pid === LOTTERY_PRODUCTS.pro) { isPro = true; productId = pid; }
      }
      return json({ subscribed: isBasic || isPro, isBasic, isPro, subscription_end: subscriptionEnd, product_id: productId });
    }

    if (action === "phobia") {
      const { data: credits } = await sb.from("phobia_credits").select("*").eq("user_id", user.id).maybeSingle();
      const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
      let subscribed = false, subscription_end: string | null = null;
      if (customers.data.length > 0) {
        const subs = await stripe.subscriptions.list({ customer: customers.data[0].id, status: "active", limit: 1 });
        if (subs.data.length > 0) { subscribed = true; subscription_end = periodEndIso(subs.data[0]); }
      }
      return json({
        subscribed, subscription_end,
        credits_remaining: credits?.credits_remaining || 0,
        total_credits_purchased: credits?.total_credits_purchased || 0,
      });
    }

    if (action === "tipster") {
      const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
      let has = false, end: string | null = null;
      if (customers.data.length > 0) {
        const subs = await stripe.subscriptions.list({ customer: customers.data[0].id, status: "active", limit: 10 });
        const t = subs.data.find((s) => s.items.data.some((it) => (it.price.product as string) === TIPSTER_PRODUCT_ID));
        if (t) { has = true; end = periodEndIso(t); }
      }
      if (has && end) {
        const { data: existing } = await sb.from("sports_tipsters").select("id, status").eq("user_id", user.id).single();
        if (existing?.status === "pending") {
          await sb.from("sports_tipsters").update({ status: "active", subscription_end: end }).eq("user_id", user.id);
        }
      }
      return json({ has_tipster_subscription: has, tipster_subscription_end: end });
    }

    if (action === "megatalent_sub") {
      const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
      if (customers.data.length === 0) {
        await sb.from("megatalent_subscriptions").update({ status: "inactive" }).eq("user_id", user.id).eq("status", "active");
        return json({ subscribed: false, tier: null });
      }
      const customerId = customers.data[0].id;
      const subs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 5 });
      const mtSub = subs.data.find((s) => s.items.data.some((it) => MT_PRICE_TO_TIER[it.price.id]));
      if (!mtSub) {
        await sb.from("megatalent_subscriptions").update({ status: "inactive" }).eq("user_id", user.id).eq("status", "active");
        return json({ subscribed: false, tier: null });
      }
      const priceId = mtSub.items.data.find((it) => MT_PRICE_TO_TIER[it.price.id])!.price.id;
      const tier = MT_PRICE_TO_TIER[priceId];
      const end = periodEndIso(mtSub)!;
      const payload = {
        user_id: user.id, tier, price: MT_TIER_PRICE[tier], bonus_votes: 0,
        win_chance_boost: tier === "top_premium" ? 100 : 0,
        status: "active", stripe_customer_id: customerId,
        stripe_subscription_id: mtSub.id, current_period_end: end,
      };
      const { data: existing } = await sb.from("megatalent_subscriptions").select("id").eq("user_id", user.id).maybeSingle();
      if (existing) await sb.from("megatalent_subscriptions").update(payload).eq("id", existing.id);
      else await sb.from("megatalent_subscriptions").insert(payload);
      return json({ subscribed: true, tier, current_period_end: end });
    }

    if (action === "megatalent_vip") {
      const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
      if (customers.data.length === 0) {
        await sb.from("megatalent_vip_viewers").upsert({ user_id: user.id, status: "inactive" }, { onConflict: "user_id" });
        return json({ is_vip: false });
      }
      const customerId = customers.data[0].id;
      const subs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 10 });
      const vipSub = subs.data.find((s) =>
        s.metadata?.kind === "megatalent_vip_viewer" ||
        s.items.data.some((i) => i.price.nickname?.includes("VIP")),
      ) ?? subs.data[0];
      const isVip = !!vipSub && vipSub.status === "active";
      const end = vipSub ? periodEndIso(vipSub) : null;
      await sb.from("megatalent_vip_viewers").upsert({
        user_id: user.id,
        status: isVip ? "active" : "inactive",
        stripe_customer_id: customerId,
        stripe_subscription_id: vipSub?.id ?? null,
        current_period_end: end,
      }, { onConflict: "user_id" });
      return json({ is_vip: isVip, current_period_end: end });
    }

    return json({ error: `Unknown action: ${action}` }, 400);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[check-router:${action}]`, msg);
    return json({ error: msg }, 500);
  }
});
