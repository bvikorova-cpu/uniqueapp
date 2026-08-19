// Sync the current user's Challenge PRO / TOP subscription status from Stripe
// into public.challenge_pro_subscribers. Returns { active, activeUntil, tier }.
// TOP tier (€5/mo): grants **500,000 XP guaranteed** once per Stripe billing
// period (tracked via top_last_grant_period). AI credits (1,000,000) + 5%
// cash prize pool remain WIN-ONLY (see award_eco_monthly_winner /
// award_healthy_monthly_winner SQL functions).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };

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

    const subs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 50 });

    type Entry = { end: number; start: number; subId: string };
    const CHALLENGES = ["eco", "healthy"] as const;
    const best: Record<string, { pro: Entry | null; top: Entry | null }> = {
      eco: { pro: null, top: null },
      healthy: { pro: null, top: null } };

    const put = (ch: string, kind: "pro" | "top", e: Entry) => {
      const cur = best[ch][kind];
      if (!cur || e.end > cur.end) best[ch][kind] = e;
    };

    for (const s of subs.data) {
      const md = (s.metadata || {}) as Record<string, string>;
      const kind = md.type || md.product || "";
      const entry = { end: s.current_period_end, start: s.current_period_start, subId: s.id };
      if (kind === "challenge_top_eco") put("eco", "top", entry);
      else if (kind === "challenge_pro_eco") put("eco", "pro", entry);
      else if (kind === "challenge_top_healthy") put("healthy", "top", entry);
      else if (kind === "challenge_pro_healthy") put("healthy", "pro", entry);
      // Legacy combined plans unlocked both sections
      else if (kind === "challenge_top") { put("eco", "top", entry); put("healthy", "top", entry); }
      else if (kind === "challenge_pro") { put("eco", "pro", entry); put("healthy", "pro", entry); }
    }

    const result: Record<string, { active: boolean; tier: "pro" | "top" | null; activeUntil: string | null }> = {};
    let grantedXp = 0;

    for (const ch of CHALLENGES) {
      const bTop = best[ch].top;
      const bPro = best[ch].pro;
      const match = bTop || bPro;
      const tier: "top" | "pro" | null = bTop ? "top" : bPro ? "pro" : null;

      if (!match || !tier) {
        await admin.from("challenge_pro_subscribers").delete()
          .eq("user_id", user.id).eq("challenge", ch);
        result[ch] = { active: false, tier: null, activeUntil: null };
        continue;
      }

      const activeUntil = new Date(match.end * 1000).toISOString();
      const periodKey = `${match.subId}:${match.start}:${ch}`;

      const { data: existing } = await admin
        .from("challenge_pro_subscribers")
        .select("top_last_grant_period")
        .eq("user_id", user.id)
        .eq("challenge", ch)
        .maybeSingle();

      const alreadyGranted = (existing as any)?.top_last_grant_period === periodKey;
      const shouldGrantTopXp = tier === "top" && !alreadyGranted;

      const upsertRow: Record<string, unknown> = { user_id: user.id,
        challenge: ch,
        tier,
        active_until: activeUntil,
        stripe_subscription_id: match.subId,
        stripe_customer_id: customerId,
        updated_at: new Date().toISOString() };
      if (shouldGrantTopXp) upsertRow.top_last_grant_period = periodKey;

      const { error: upsertErr } = await admin
        .from("challenge_pro_subscribers")
        .upsert(upsertRow, { onConflict: "user_id,challenge" });

      let xpUpsertOk: boolean | null = null;
      let xpErrorMsg: string | null = null;
      let xpForThis = 0;

      if (shouldGrantTopXp && !upsertErr) {
        xpForThis = 500000;
        const { data: xpRow } = await admin
          .from("user_xp")
          .select("total_xp")
          .eq("user_id", user.id)
          .maybeSingle();
        const current = (xpRow as any)?.total_xp ?? 0;
        const { error: xpErr } = await admin
          .from("user_xp")
          .upsert({ user_id: user.id, total_xp: current + xpForThis }, { onConflict: "user_id" });
        xpUpsertOk = !xpErr;
        if (xpErr) { xpErrorMsg = xpErr.message; xpForThis = 0; }

        if (!xpErr) {
          grantedXp += 500000;
          await admin.from("notifications").insert({
            user_id: user.id,
            type: "challenge_top_monthly",
            title: "👑 TOP monthly bonus",
            message: `You received your guaranteed 500,000 XP for being a ${ch === "eco" ? "Eco" : "Healthy"} Challenge TOP subscriber this month!`,
            data: { xp: 500000, period: periodKey, challenge: ch } });
        }
      }

      const auditResult: "granted" | "skipped_already_granted" | "skipped_wrong_tier" | "error" =
        xpErrorMsg ? "error"
          : shouldGrantTopXp ? "granted"
            : tier !== "top" ? "skipped_wrong_tier" : "skipped_already_granted";

      await admin.from("challenge_xp_grant_log").insert({ user_id: user.id,
        tier,
        sub_id: match.subId,
        period_key: periodKey,
        xp_amount: xpForThis,
        result: auditResult,
        reason: `challenge=${ch}`,
        upsert_ok: xpUpsertOk,
        error_message: xpErrorMsg });

      result[ch] = { active: true, tier, activeUntil };
    }

    log("synced", { user: user.id, result, grantedXp });
    return json({ active: result.eco.active || result.healthy.active, challenges: result, grantedXp }, 200);


  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log("ERROR", msg);
    return json({ active: false, error: msg }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status });
}
