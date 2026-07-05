// Sync the current user's Challenge PRO / TOP subscription status from Stripe
// into public.challenge_pro_subscribers. Returns { active, activeUntil, tier }.
// TOP tier (€5/mo): grants **500,000 XP guaranteed** once per Stripe billing
// period (tracked via top_last_grant_period). AI credits (1,000,000) + 5%
// cash prize pool remain WIN-ONLY (see award_eco_monthly_winner /
// award_healthy_monthly_winner SQL functions).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    const periodKey = `${match.subId}:${match.start}`;

    // Read existing row to detect whether we already granted TOP XP this period
    const { data: existing } = await admin
      .from("challenge_pro_subscribers")
      .select("top_last_grant_period")
      .eq("user_id", user.id)
      .maybeSingle();

    const shouldGrantTopXp =
      tier === "top" && (existing as any)?.top_last_grant_period !== periodKey;

    const upsertRow: Record<string, unknown> = {
      user_id: user.id,
      tier,
      active_until: activeUntil,
      stripe_subscription_id: match.subId,
      stripe_customer_id: customerId,
      updated_at: new Date().toISOString(),
    };
    if (shouldGrantTopXp) upsertRow.top_last_grant_period = periodKey;

    await admin
      .from("challenge_pro_subscribers")
      .upsert(upsertRow, { onConflict: "user_id" });

    // Grant guaranteed 500,000 XP for TOP subscribers, once per billing period
    let grantedXp = 0;
    if (shouldGrantTopXp) {
      grantedXp = 500000;
      const { data: xpRow } = await admin
        .from("user_xp")
        .select("total_xp")
        .eq("user_id", user.id)
        .maybeSingle();
      const current = (xpRow as any)?.total_xp ?? 0;
      await admin
        .from("user_xp")
        .upsert({ user_id: user.id, total_xp: current + grantedXp }, { onConflict: "user_id" });

      await admin.from("notifications").insert({
        user_id: user.id,
        type: "challenge_top_monthly",
        title: "👑 TOP monthly bonus",
        message: "You received your guaranteed 500,000 XP for being a Challenge TOP subscriber this month!",
        data: { xp: grantedXp, period: periodKey },
      });
    }

    log("synced", { user: user.id, tier, activeUntil, grantedXp });
    return json({ active: true, tier, activeUntil, grantedXp }, 200);

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
