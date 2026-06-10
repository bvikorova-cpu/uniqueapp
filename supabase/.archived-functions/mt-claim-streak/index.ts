import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const REWARDS: Record<number, { label: string; xp: number; boost?: boolean; premiumDays?: number }> = {
  3: { label: "+50 XP", xp: 50 },
  7: { label: "+200 XP", xp: 200 },
  14: { label: "Boost x1", xp: 0, boost: true },
  30: { label: "Premium 1d", xp: 0, premiumDays: 1 },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization") ?? "";
    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: u } = await userClient.auth.getUser();
    if (!u.user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const userId = u.user.id;

    const body = await req.json().catch(() => ({}));
    const day = Number(body?.day);
    const reward = REWARDS[day];
    if (!reward) return new Response(JSON.stringify({ error: "invalid_day" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // VIP guard — Megatalent streak rewards are paid-tier only.
    const { data: sub } = await supa
      .from("megatalent_subscriptions")
      .select("status, current_period_end")
      .eq("user_id", userId)
      .maybeSingle();
    const vipActive =
      sub &&
      (sub.status === "active" || sub.status === "trialing") &&
      (!sub.current_period_end || new Date(sub.current_period_end) > new Date());
    if (!vipActive) {
      return new Response(JSON.stringify({ error: "vip_required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Verify streak from last 30 days votes
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    const { data: votes } = await supa.from("talent_votes").select("created_at").eq("user_id", userId).gte("created_at", since);
    const days = new Set<string>();
    (votes ?? []).forEach((r: any) => days.add(new Date(r.created_at).toISOString().slice(0, 10)));
    let streak = 0;
    const d = new Date();
    while (true) {
      const k = d.toISOString().slice(0, 10);
      if (days.has(k)) { streak++; d.setDate(d.getDate() - 1); }
      else if (streak === 0 && k === new Date().toISOString().slice(0, 10)) { d.setDate(d.getDate() - 1); }
      else break;
    }
    if (streak < day) return new Response(JSON.stringify({ error: "streak_insufficient", streak }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Insert claim (unique)
    const { error: insErr } = await supa.from("mt_streak_claims").insert({ user_id: userId, day, reward_label: reward.label });
    if (insErr) {
      if (insErr.code === "23505") return new Response(JSON.stringify({ error: "already_claimed" }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw insErr;
    }

    // Grant XP via hub_xp
    if (reward.xp > 0) {
      const { data: row } = await supa.from("hub_xp").select("xp").eq("user_id", userId).eq("hub", "megatalent").maybeSingle();
      if (row) await supa.from("hub_xp").update({ xp: (row.xp ?? 0) + reward.xp }).eq("user_id", userId).eq("hub", "megatalent");
      else await supa.from("hub_xp").insert({ user_id: userId, hub: "megatalent", xp: reward.xp });
    }
    if (reward.boost) {
      await supa.from("megatalent_boosts").insert({ user_id: userId, boost_type: "streak", multiplier: 2, expires_at: new Date(Date.now() + 86400000).toISOString() }).select();
    }
    if (reward.premiumDays) {
      const expires = new Date(Date.now() + reward.premiumDays * 86400000).toISOString();
      await supa.from("megatalent_subscriptions").upsert({ user_id: userId, tier: "premium", status: "active", current_period_end: expires }, { onConflict: "user_id" });
    }

    return new Response(JSON.stringify({ ok: true, reward: reward.label, streak }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("mt-claim-streak error", e);
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
