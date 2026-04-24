// Admin-only subscription analytics. Pulls live data from Stripe (subscriptions
// + invoices for the last 12 months) and computes MRR, ARR, active subs,
// trialing, past_due, churn rate, ARPU, and a 12-month MRR trend. Returns
// aggregated numbers only — no PII. Audit-logged.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // Auth + admin gate
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Missing auth" }, 401);
    const { data: u } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (!u.user) return json({ error: "Not authenticated" }, 401);
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: u.user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "Admin only" }, 403);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2025-08-27.basil",
    });

    // ─── ACTIVE SUBSCRIPTIONS ────────────────────────────────────────
    const subs: Stripe.Subscription[] = [];
    let cursor: string | undefined;
    do {
      const page = await stripe.subscriptions.list({
        status: "all", limit: 100, starting_after: cursor,
      });
      subs.push(...page.data);
      cursor = page.has_more ? page.data[page.data.length - 1].id : undefined;
    } while (cursor && subs.length < 1000); // safety cap

    const monthly = (price: Stripe.Price | null | undefined): number => {
      if (!price?.unit_amount || !price.recurring) return 0;
      const amt = price.unit_amount / 100;
      switch (price.recurring.interval) {
        case "day":   return amt * 30 / (price.recurring.interval_count || 1);
        case "week":  return amt * 4.345 / (price.recurring.interval_count || 1);
        case "month": return amt / (price.recurring.interval_count || 1);
        case "year":  return amt / 12 / (price.recurring.interval_count || 1);
        default: return 0;
      }
    };

    let mrr = 0, activeCount = 0, trialingCount = 0, pastDueCount = 0,
        canceledCount = 0, scheduledCancel = 0;
    for (const s of subs) {
      const subMrr = s.items.data.reduce(
        (sum, it) => sum + monthly(it.price) * (it.quantity ?? 1), 0);
      if (s.status === "active") { activeCount++; mrr += subMrr; }
      else if (s.status === "trialing") trialingCount++;
      else if (s.status === "past_due") { pastDueCount++; mrr += subMrr; }
      else if (s.status === "canceled") canceledCount++;
      if (s.cancel_at_period_end) scheduledCancel++;
    }

    // ─── 30-DAY CHURN ────────────────────────────────────────────────
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 86400;
    const recentlyCanceled = subs.filter(
      (s) => s.canceled_at && s.canceled_at >= thirtyDaysAgo,
    ).length;
    const churnRate = activeCount + recentlyCanceled > 0
      ? (recentlyCanceled / (activeCount + recentlyCanceled)) * 100
      : 0;

    // ─── 12-MONTH MRR TREND (from invoices) ───────────────────────────
    const monthsBack = 12;
    const trend: { month: string; revenue: number; invoices: number }[] = [];
    const buckets = new Map<string, { revenue: number; invoices: number }>();
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i); d.setDate(1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      buckets.set(key, { revenue: 0, invoices: 0 });
    }
    const since = Math.floor(
      new Date(new Date().setMonth(new Date().getMonth() - monthsBack)).getTime() / 1000,
    );
    let invCursor: string | undefined;
    let invoicesScanned = 0;
    do {
      const page = await stripe.invoices.list({
        status: "paid", created: { gte: since }, limit: 100, starting_after: invCursor,
      });
      for (const inv of page.data) {
        const d = new Date((inv.status_transitions?.paid_at ?? inv.created) * 1000);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const b = buckets.get(key);
        if (b) {
          b.revenue += (inv.amount_paid ?? 0) / 100;
          b.invoices += 1;
        }
        invoicesScanned++;
      }
      invCursor = page.has_more ? page.data[page.data.length - 1].id : undefined;
    } while (invCursor && invoicesScanned < 2000);

    for (const [month, v] of buckets) trend.push({ month, ...v });

    // ─── ARPU & LTV ──────────────────────────────────────────────────
    const arpu = activeCount > 0 ? mrr / activeCount : 0;
    const ltv = churnRate > 0 ? arpu / (churnRate / 100) : arpu * 24; // cap at ~24mo if zero churn

    // Audit
    await supabase.from("admin_audit_log").insert({
      admin_id: u.user.id,
      action: "subscription_analytics_viewed",
      target_type: "stripe_subscriptions",
      target_id: u.user.id,
      details: { active: activeCount, mrr },
    });

    return json({
      mrr: Math.round(mrr * 100) / 100,
      arr: Math.round(mrr * 12 * 100) / 100,
      arpu: Math.round(arpu * 100) / 100,
      ltv: Math.round(ltv * 100) / 100,
      active: activeCount,
      trialing: trialingCount,
      past_due: pastDueCount,
      canceled_total: canceledCount,
      scheduled_to_cancel: scheduledCancel,
      churn_30d_pct: Math.round(churnRate * 100) / 100,
      churned_30d: recentlyCanceled,
      trend,
      invoices_scanned: invoicesScanned,
      generated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[admin-subscription-analytics]", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
