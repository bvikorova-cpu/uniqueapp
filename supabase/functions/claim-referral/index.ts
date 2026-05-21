// Captures referral attribution for newly signed-up users AND scores fraud risk.
// Self-referral, shared signup IP, disposable email domains, and velocity all
// raise the score. status >= 70 → 'blocked' (no reward), 40-69 → 'flagged'
// (manual admin review), <40 → 'approved' (auto-rewarded by stripe-webhook on
// first subscription).

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com",
  "yopmail.com", "trashmail.com", "throwawaymail.com", "fakeinbox.com",
  "sharklasers.com", "getnada.com", "maildrop.cc", "dispostable.com",
  "mintemail.com", "mohmal.com", "spamgourmet.com", "tmpmail.org",
  "temp-mail.org", "tempail.com",
]);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Missing auth" }, 401);
    const token = auth.replace("Bearer ", "");
    const { data: u } = await supabase.auth.getUser(token);
    const user = u.user;
    if (!user) return json({ error: "Not authenticated" }, 401);

    const { code } = await req.json().catch(() => ({}));
    if (!code || typeof code !== "string") return json({ error: "Missing code" }, 400);

    // Capture signup signals from request
    const signupIp =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      null;
    const userAgent = req.headers.get("user-agent") || null;

    // Persist signals on the buyer's profile (one-shot, only if empty)
    await supabase
      .from("profiles")
      .update({ signup_ip: signupIp, signup_user_agent: userAgent })
      .eq("id", user.id)
      .is("signup_ip", null);

    // Resolve code → referrer
    let referrerId: string | null = null;
    const { data: codeRow } = await supabase
      .from("megatalent_referral_codes")
      .select("user_id")
      .eq("code", code)
      .maybeSingle();
    if (codeRow?.user_id) referrerId = codeRow.user_id;
    if (!referrerId && code.startsWith("UNIQ-")) {
      const prefix = code.slice(5).toLowerCase();
      const { data: prof } = await supabase
        .from("profiles").select("id").ilike("id", `${prefix}%`).limit(1).maybeSingle();
      if (prof?.id) referrerId = prof.id;
    }
    if (!referrerId) return json({ error: "Invalid referral code" }, 404);

    // ─── FRAUD CHECKS ────────────────────────────────────────────────
    let score = 0;
    const reasons: { reason: string; details: any; severity: string }[] = [];

    // 1. Self-referral
    if (referrerId === user.id) {
      score = 100;
      reasons.push({ reason: "self_referral", details: {}, severity: "high" });
      return persistAndRespond("blocked");
    }

    // 2. Already attributed
    const { data: existing } = await supabase
      .from("referral_attributions")
      .select("id")
      .eq("referred_user_id", user.id)
      .maybeSingle();
    if (existing) return json({ ok: true, alreadyClaimed: true });

    // 3. Disposable email domain
    if (user.email) {
      const domain = user.email.split("@")[1]?.toLowerCase();
      if (domain && DISPOSABLE_DOMAINS.has(domain)) {
        score += 50;
        reasons.push({ reason: "disposable_email", details: { domain }, severity: "high" });
      }
    }

    // 4. Shared signup IP with the referrer
    if (signupIp) {
      const { data: refProfile } = await supabase
        .from("profiles").select("signup_ip").eq("id", referrerId).maybeSingle();
      if (refProfile?.signup_ip && refProfile.signup_ip === signupIp) {
        score += 60;
        reasons.push({ reason: "shared_ip_with_referrer", details: { ip: signupIp }, severity: "high" });
      }

      // 5. Velocity: same IP referred 3+ users in 24h
      const { count: ipCount } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("signup_ip", signupIp)
        .gte("created_at", new Date(Date.now() - 86400000).toISOString());
      if ((ipCount ?? 0) >= 3) {
        score += 40;
        reasons.push({ reason: "ip_velocity", details: { ip: signupIp, count: ipCount }, severity: "medium" });
      }
    }

    // 6. Velocity: referrer claimed 5+ rewards in last 24h
    const { count: recentRewards } = await supabase
      .from("megatalent_referral_earnings")
      .select("id", { count: "exact", head: true })
      .eq("referrer_id", referrerId)
      .gte("created_at", new Date(Date.now() - 86400000).toISOString());
    if ((recentRewards ?? 0) >= 5) {
      score += 30;
      reasons.push({ reason: "referrer_velocity", details: { count: recentRewards }, severity: "medium" });
    }

    const status = score >= 70 ? "blocked" : score >= 40 ? "flagged" : "approved";
    return await persistAndRespond(status);

    // ── helper closures ──
    async function persistAndRespond(finalStatus: string) {
      const { data: attr, error: attrErr } = await supabase
        .from("referral_attributions")
        .insert({
          referrer_id: referrerId,
          referred_user_id: user.id,
          code,
          fraud_score: score,
          status: finalStatus,
          fraud_reasons: reasons,
        })
        .select("id")
        .single();
      if (attrErr) return json({ error: attrErr.message }, 500);

      if (reasons.length) {
        await supabase.from("referral_fraud_flags").insert(
          reasons.map((r) => ({
            attribution_id: attr.id,
            referrer_id: referrerId!,
            referred_user_id: user.id,
            reason: r.reason,
            details: r.details,
            severity: r.severity,
          })),
        );
      }

      // Award XP immediately on approved referral (idempotent via ref_id)
      let xpAwarded = false;
      if (finalStatus === "approved") {
        const refId = attr.id;
        const [r1, r2] = await Promise.all([
          supabase.rpc("award_xp", {
            _user_id: referrerId,
            _amount: 2500,
            _source: "referral_signup",
            _ref_id: refId,
          }),
          supabase.rpc("award_xp", {
            _user_id: user.id,
            _amount: 1250,
            _source: "referral_welcome",
            _ref_id: refId,
          }),
        ]);
        xpAwarded = !r1.error && !r2.error;
      }

      return json({
        ok: true,
        status: finalStatus,
        fraud_score: score,
        reasons,
        xp_awarded: xpAwarded,
        referrer_xp: finalStatus === "approved" ? 2500 : 0,
        welcome_xp: finalStatus === "approved" ? 1250 : 0,
      });
    }
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
