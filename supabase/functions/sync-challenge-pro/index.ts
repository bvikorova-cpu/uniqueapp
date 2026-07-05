// Sync the current user's Challenge PRO / TOP subscription status from Stripe
// into public.challenge_pro_subscribers. Returns { active, activeUntil, tier }.
// TOP subscribers (€5/mo) also receive a monthly bonus grant of 500,000 XP
// and 1,000,000 ai_credits (non-cashable, platform use only) — granted once
// per Stripe billing period.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TOP_XP_BONUS = 500_000;
const TOP_CREDITS_BONUS = 1_000_000;

const log = (s: string, d?: unknown) =>
  console.log(`[SYNC-CHALLENGE-PRO] ${s}${d ? ` ${JSON.stringify(d)}` : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ active: false, reason: "no-auth" }, 200);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData.user?.email) return json({ active: false, reason: "invalid-auth" }, 200);
    const user = userData.user;

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      await admin.from("challenge_pro_subscribers").delete().eq("user_id", user.id);
      return json({ active: false }, 200);
    }
    const customerId = customers.data[0].id;

    const subs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 20 });

    // Find highest matching sub. TOP outranks PRO.
    let bestPro: { end: number; start: number; subId: string } | null = null;
    let bestTop: { end: number; start: number; subId: string } | null = null;
    for (const s of subs.data) {
      const md = (s.metadata || {}) as Record<string, string>;
      const kind = md.type || md.product;
      const entry = { end: s.current_period_end, start: s.current_period_start, subId: s.id };
      if (kind === "challenge_top") {
        if (!bestTop || s.current_period_end > bestTop.end) bestTop = entry;
      } else if (kind === "challenge_pro") {
        if (!bestPro || s.current_period_end > bestPro.end) bestPro = entry;
      }
    }

    const match = bestTop || bestPro;
    const tier: "top" | "pro" | null = bestTop ? "top" : bestPro ? "pro" : null;

    if (!match || !tier) {
      await admin.from("challenge_pro_subscribers").delete().eq("user_id", user.id);
      return json({ active: false }, 200);
    }

    const activeUntil = new Date(match.end * 1000).toISOString();
    const periodStart = new Date(match.start * 1000).toISOString();

    // Fetch existing row to compare billing-period marker for TOP grants
    const { data: existing } = await admin
      .from("challenge_pro_subscribers")
      .select("top_last_grant_period, tier")
      .eq("user_id", user.id)
      .maybeSingle();

    const alreadyGrantedThisPeriod =
      tier === "top" &&
      existing?.top_last_grant_period &&
      new Date(existing.top_last_grant_period as string).getTime() >= new Date(periodStart).getTime();

    const upsertRow: Record<string, unknown> = {
      user_id: user.id,
      tier,
      active_until: activeUntil,
      stripe_subscription_id: match.subId,
      stripe_customer_id: customerId,
      updated_at: new Date().toISOString(),
    };

    let grantedXp = 0;
    let grantedCredits = 0;

    if (tier === "top" && !alreadyGrantedThisPeriod) {
      // Grant XP bonus via canonical RPC (uses SECURITY DEFINER)
      const { error: xpErr } = await admin.rpc("add_user_points", {
        p_user_id: user.id,
        p_points: TOP_XP_BONUS,
        p_activity_type: "challenge_top_monthly",
        p_meta: JSON.stringify({ subscription_id: match.subId, period_start: periodStart }),
      });
      if (xpErr) {
        log("XP grant failed", xpErr.message);
      } else {
        grantedXp = TOP_XP_BONUS;
      }

      // Grant ai_credits with ledger audit tags (via set_config in same tx)
      // Ensure a row exists, then increment
      const { data: creditsRow } = await admin
        .from("ai_credits")
        .select("credits_remaining")
        .eq("user_id", user.id)
        .maybeSingle();

      const current = Number((creditsRow as any)?.credits_remaining ?? 0);
      const newBalance = current + TOP_CREDITS_BONUS;

      // Set audit context for the credits ledger trigger
      try {
        await admin.rpc("set_config" as any, {
          setting_name: "app.credit_reason",
          new_value: "challenge_top_monthly_grant",
          is_local: false,
        });
      } catch { /* set_config RPC not exposed on all projects — best-effort */ }

      if (creditsRow) {
        const { error: updErr } = await admin
          .from("ai_credits")
          .update({
            credits_remaining: newBalance,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
        if (!updErr) grantedCredits = TOP_CREDITS_BONUS;
        else log("ai_credits update failed", updErr.message);
      } else {
        const { error: insErr } = await admin.from("ai_credits").insert({
          user_id: user.id,
          credits_remaining: newBalance,
          total_credits_purchased: 0,
        });
        if (!insErr) grantedCredits = TOP_CREDITS_BONUS;
        else log("ai_credits insert failed", insErr.message);
      }

      upsertRow.top_last_grant_period = periodStart;

      log("TOP monthly grant issued", {
        user: user.id,
        xp: grantedXp,
        credits: grantedCredits,
        periodStart,
      });
    }

    await admin
      .from("challenge_pro_subscribers")
      .upsert(upsertRow, { onConflict: "user_id" });

    log("synced", { user: user.id, tier, activeUntil });
    return json({
      active: true,
      tier,
      activeUntil,
      grantedXp,
      grantedCredits,
    }, 200);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log("ERROR", msg);
    return json({ active: false, error: msg }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}
