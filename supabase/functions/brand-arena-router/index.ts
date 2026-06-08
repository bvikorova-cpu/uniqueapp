import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const CREDIT_COSTS: Record<string, number> = {
  "ai.brandAnalyzer": 5,
  "ai.battlePredictor": 3,
  "ai.battlePost": 4,
  "ai.sentimentHeatmap": 3,
  "ai.demoBreakdown": 3,
  "ai.trendTimeline": 3,
  "share.unlockVote": 0,
};

async function spendCredits(admin: any, userId: string, amount: number) {
  if (amount <= 0) return;
  const { data: row } = await admin
    .from("brand_battle_credits")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  const bal = row?.credits_balance ?? 0;
  if (bal < amount) {
    const e: any = new Error("Insufficient credits");
    e.status = 402;
    throw e;
  }
  if (row) {
    await admin
      .from("brand_battle_credits")
      .update({
        credits_balance: bal - amount,
        total_credits_spent: (row.total_credits_spent ?? 0) + amount,
      })
      .eq("user_id", userId);
  } else {
    await admin
      .from("brand_battle_credits")
      .insert({ user_id: userId, credits_balance: 0, total_credits_spent: amount });
  }
}

async function callAI(prompt: string, system = "You are a brand analyst. Reply with concise JSON.") {
  if (!OPENAI_API_KEY) return { text: "AI unavailable" };
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`AI gateway error ${res.status}`);
  const j = await res.json();
  return { text: j.choices?.[0]?.message?.content ?? "" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

    // ── Enterprise public REST API (X-API-Key auth, no JWT) ─────────────
    const apiKey =
      req.headers.get("x-api-key") ||
      req.headers.get("X-API-Key") ||
      new URL(req.url).searchParams.get("api_key");

    if (apiKey && apiKey.startsWith("ba_live_")) {
      const url = new URL(req.url);
      const { data: keyRow } = await admin
        .from("brand_sponsor_api_keys")
        .select("sponsor_id")
        .eq("api_key", apiKey)
        .maybeSingle();
      if (!keyRow) {
        return new Response(JSON.stringify({ error: "invalid_api_key" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: sponsor } = await admin
        .from("brand_sponsors").select("*").eq("id", keyRow.sponsor_id).maybeSingle();
      if (!sponsor) return new Response(JSON.stringify({ error: "sponsor_not_found" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (sponsor.subscription_status !== "active") return new Response(JSON.stringify({ error: "subscription_not_active" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (sponsor.tier !== "enterprise") return new Response(JSON.stringify({ error: "api_access_requires_enterprise_tier" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const apiAction = url.searchParams.get("action") || "me";
      let payload: any = { error: "unknown_action" };
      let status = 400;
      if (apiAction === "me") { payload = { sponsor }; status = 200; }
      else if (apiAction === "votes") {
        const days = Math.min(90, Math.max(1, Number(url.searchParams.get("days") ?? 30)));
        const since = new Date(Date.now() - days * 86400_000).toISOString();
        const { data } = await admin.from("brand_votes").select("created_at").eq("brand_id", sponsor.id).gte("created_at", since);
        const byDate: Record<string, number> = {};
        (data ?? []).forEach((v: any) => { const d = new Date(v.created_at).toISOString().slice(0,10); byDate[d] = (byDate[d]||0)+1; });
        payload = { brand_id: sponsor.id, days, total: data?.length ?? 0,
          series: Object.entries(byDate).sort(([a],[b])=>a.localeCompare(b)).map(([date,votes])=>({date,votes})) };
        status = 200;
      } else if (apiAction === "rank") {
        const { data } = await admin.from("brand_sponsors").select("id,total_votes")
          .eq("subscription_status","active").eq("moderation_status","approved").order("total_votes",{ascending:false});
        const rank = (data ?? []).findIndex((s:any)=>s.id===sponsor.id)+1;
        payload = { rank: rank || null, total: data?.length ?? 0, total_votes: sponsor.total_votes };
        status = 200;
      } else if (apiAction === "competitors") {
        const { data } = await admin.from("brand_sponsors").select("id,name,logo,tier,total_votes,category")
          .eq("category", sponsor.category).eq("subscription_status","active").eq("moderation_status","approved")
          .neq("id", sponsor.id).order("total_votes",{ascending:false}).limit(10);
        payload = { category: sponsor.category, competitors: data ?? [] };
        status = 200;
      }
      return new Response(JSON.stringify(payload), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Authenticated JWT flow (existing internal actions) ──────────────
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await admin.auth.getUser(token);
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const action: string = body.action;
    if (!action) throw new Error("Missing action");

    const cost = CREDIT_COSTS[action] ?? 0;
    if (cost > 0) await spendCredits(admin, user.id, cost);

    let result: any = { ok: true };

    switch (action) {
      // --- Generic record CRUD ---
      case "records.list": {
        const { kind, parent_id, mine, limit = 50 } = body;
        let q = admin.from("brand_arena_records").select("*").order("created_at", { ascending: false }).limit(limit);
        if (kind) q = q.eq("kind", kind);
        if (parent_id) q = q.eq("parent_id", parent_id);
        if (mine) q = q.eq("user_id", user.id);
        const { data, error } = await q;
        if (error) throw error;
        result = { records: data };
        break;
      }
      case "records.create": {
        const { kind, payload = {}, parent_id = null, is_public = true } = body;
        if (!kind) throw new Error("kind required");
        const { data, error } = await admin
          .from("brand_arena_records")
          .insert({ user_id: user.id, kind, payload, parent_id, is_public })
          .select()
          .single();
        if (error) throw error;
        result = { record: data };
        break;
      }
      case "records.update": {
        const { id, payload, is_public } = body;
        const upd: any = {};
        if (payload !== undefined) upd.payload = payload;
        if (is_public !== undefined) upd.is_public = is_public;
        const { data, error } = await admin
          .from("brand_arena_records")
          .update(upd)
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single();
        if (error) throw error;
        result = { record: data };
        break;
      }
      case "records.delete": {
        const { id } = body;
        const { error } = await admin
          .from("brand_arena_records")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);
        if (error) throw error;
        result = { ok: true };
        break;
      }

      // --- AI features (credit-gated) ---
      case "ai.brandAnalyzer": {
        const { brand } = body;
        const { text } = await callAI(
          `Analyze brand "${brand}". Return JSON {strengths:[], weaknesses:[], opportunities:[], threats:[], sentiment_score:0-100, summary}.`
        );
        result = { analysis: text };
        break;
      }
      case "ai.battlePredictor": {
        const { brandA, brandB, history = [] } = body;
        const { text } = await callAI(
          `Predict winner between "${brandA}" and "${brandB}". History: ${JSON.stringify(history)}. Return JSON {winner, confidence:0-100, reasoning}.`
        );
        result = { prediction: text };
        break;
      }
      case "ai.battlePost": {
        const { brandA, brandB, winner } = body;
        const { text } = await callAI(
          `Create an Instagram carousel post text for a brand battle between "${brandA}" and "${brandB}", winner "${winner}". Return JSON {slides:[{headline, body}], caption, hashtags:[]}.`
        );
        result = { post: text };
        break;
      }
      case "ai.sentimentHeatmap": {
        const { brand } = body;
        const { text } = await callAI(
          `Generate a regional sentiment heatmap for brand "${brand}" by continent. Return JSON {regions:[{name, score:0-100}]}.`
        );
        result = { heatmap: text };
        break;
      }
      case "ai.demoBreakdown": {
        const { brand } = body;
        const { text } = await callAI(
          `Estimate demographic breakdown of voters for brand "${brand}". Return JSON {age_groups:[{label, pct}], gender:[{label, pct}], top_countries:[{code, pct}]}.`
        );
        result = { demographics: text };
        break;
      }
      case "ai.trendTimeline": {
        const { brand } = body;
        const { text } = await callAI(
          `Estimate 12-month brand sentiment timeline for "${brand}". Return JSON {points:[{month, score:0-100}]}.`
        );
        result = { timeline: text };
        break;
      }

      // --- Credits balance ---
      case "credits.balance": {
        const { data } = await admin
          .from("brand_battle_credits")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        result = { credits: data };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    const status = err?.status ?? 500;
    return new Response(JSON.stringify({ error: err?.message ?? "Server error" }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
