// Kids Academy Hub router — meta features across all kids sections.
// Actions:
//   hub.credits              (free)  → { credits }
//   hub.xp        { child_id } (free) → unified XP + level + streak
//   hub.activity  { child_id, limit? } (free) → recent activity
//   hub.familyLeaderboard    (free) → all parent's children ranked by XP
//   hub.logActivity { child_id, section, action, xp } (free) → adds XP + updates streak
//   hub.dailyPlan { child_id, age?, interests? } (3 credits, AI) → generates today's plan
//   hub.completeItem { child_id, item_id } (free) → mark plan item done
//   hub.recommendations { child_id } (2 credits, AI) → smart next-step suggestions
//   hub.parentDigest (3 credits, AI) → AI weekly summary across all children
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ok = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const COSTS: Record<string, number> = {
  "hub.dailyPlan": 3,
  "hub.recommendations": 2,
  "hub.parentDigest": 3,
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";

async function callAI(messages: any[], json = true): Promise<any> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (res.status === 429) throw new Error("RATE_LIMIT");
  if (res.status === 402) throw new Error("AI_CREDITS_EXHAUSTED");
  if (!res.ok) throw new Error(`AI ${res.status}`);
  const data = await res.json();
  const txt = data?.choices?.[0]?.message?.content ?? "";
  if (!json) return txt;
  try { return JSON.parse(txt); } catch { return { raw: txt }; }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return ok({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );
    const { data: userData } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    const userId = userData.user?.id;
    if (!userId) return ok({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const action: string = body?.action ?? "";
    if (!action) return ok({ error: "Missing action" }, 400);

    // Credit gate
    const cost = COSTS[action] ?? 0;
    if (cost > 0) {
      const { data: row } = await supabase
        .from("kids_academy_credits").select("credits_remaining").eq("user_id", userId).maybeSingle();
      const bal = row?.credits_remaining ?? 0;
      if (bal < cost) {
        await supabase.from("kids_academy_credits").upsert({ user_id: userId, credits_remaining: 0 }, { onConflict: "user_id" });
        return ok({ error: "Insufficient credits", needed: cost, balance: bal }, 402);
      }
      await supabase.from("kids_academy_credits").update({ credits_remaining: bal - cost }).eq("user_id", userId);
    }

    switch (action) {
      case "hub.credits": {
        const { data } = await supabase.from("kids_academy_credits").select("credits_remaining").eq("user_id", userId).maybeSingle();
        return ok({ credits: data?.credits_remaining ?? 0 });
      }

      case "hub.xp": {
        const child_id = body.child_id;
        if (!child_id) return ok({ error: "child_id required" }, 400);
        const { data } = await supabase.from("kids_academy_xp").select("*").eq("child_id", child_id).eq("parent_id", userId).maybeSingle();
        return ok({ xp: data ?? { total_xp: 0, level: 1, current_streak: 0, longest_streak: 0 } });
      }

      case "hub.activity": {
        const child_id = body.child_id;
        const limit = Math.min(Number(body.limit ?? 20), 100);
        let q = supabase.from("kids_academy_activity_log").select("*").eq("parent_id", userId).order("created_at", { ascending: false }).limit(limit);
        if (child_id) q = q.eq("child_id", child_id);
        const { data } = await q;
        return ok({ activity: data ?? [] });
      }

      case "hub.familyLeaderboard": {
        const { data } = await supabase.from("kids_academy_xp").select("child_id, total_xp, level, current_streak").eq("parent_id", userId).order("total_xp", { ascending: false });
        return ok({ leaderboard: data ?? [] });
      }

      case "hub.logActivity": {
        const { child_id, section, action: act, xp = 0, meta = {} } = body;
        if (!child_id || !section || !act) return ok({ error: "child_id, section, action required" }, 400);
        await supabase.from("kids_academy_activity_log").insert({ parent_id: userId, child_id, section, action: act, xp_earned: xp, meta });
        // update XP + streak
        const today = new Date().toISOString().slice(0, 10);
        const { data: cur } = await supabase.from("kids_academy_xp").select("*").eq("child_id", child_id).eq("parent_id", userId).maybeSingle();
        const prevDate = cur?.last_activity_date;
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        let streak = cur?.current_streak ?? 0;
        if (prevDate === today) { /* same day */ }
        else if (prevDate === yesterday) streak += 1;
        else streak = 1;
        const totalXp = (cur?.total_xp ?? 0) + Number(xp);
        const level = Math.floor(totalXp / 100) + 1;
        const longest = Math.max(cur?.longest_streak ?? 0, streak);
        await supabase.from("kids_academy_xp").upsert({
          parent_id: userId, child_id, total_xp: totalXp, level,
          current_streak: streak, longest_streak: longest, last_activity_date: today,
        }, { onConflict: "child_id" });
        return ok({ total_xp: totalXp, level, current_streak: streak });
      }

      case "hub.dailyPlan": {
        const { child_id, age = 8, interests = [] } = body;
        if (!child_id) return ok({ error: "child_id required" }, 400);
        const today = new Date().toISOString().slice(0, 10);
        const { data: existing } = await supabase.from("kids_academy_daily_plan").select("*").eq("child_id", child_id).eq("plan_date", today).maybeSingle();
        if (existing) return ok({ plan: existing });
        const plan = await callAI([
          { role: "system", content: "You design a fun, balanced learning day for a child. Return JSON: { items: [{id, section, title, duration_min, xp}] } with 5-6 items across sections: homework, story, science, drawing, reading, career. Keep age-appropriate." },
          { role: "user", content: `Age: ${age}. Interests: ${(interests as string[]).join(", ") || "general"}. Generate today's plan.` },
        ]);
        const { data: ins } = await supabase.from("kids_academy_daily_plan").insert({ parent_id: userId, child_id, plan_date: today, plan_json: plan }).select().single();
        return ok({ plan: ins });
      }

      case "hub.completeItem": {
        const { child_id, item_id } = body;
        const today = new Date().toISOString().slice(0, 10);
        const { data: row } = await supabase.from("kids_academy_daily_plan").select("*").eq("child_id", child_id).eq("plan_date", today).maybeSingle();
        if (!row) return ok({ error: "no plan" }, 404);
        const done = Array.isArray(row.completed_items) ? row.completed_items : [];
        if (!done.includes(item_id)) done.push(item_id);
        await supabase.from("kids_academy_daily_plan").update({ completed_items: done }).eq("id", row.id);
        return ok({ completed_items: done });
      }

      case "hub.recommendations": {
        const { child_id } = body;
        if (!child_id) return ok({ error: "child_id required" }, 400);
        const { data: acts } = await supabase.from("kids_academy_activity_log").select("section, action, xp_earned, created_at").eq("child_id", child_id).order("created_at", { ascending: false }).limit(30);
        const recs = await callAI([
          { role: "system", content: "You suggest 3 smart next learning steps for a child based on recent activity. Return JSON { recommendations: [{section, title, reason, expected_xp}] }." },
          { role: "user", content: `Recent activity: ${JSON.stringify(acts ?? [])}` },
        ]);
        return ok(recs);
      }

      case "hub.parentDigest": {
        const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);
        const { data: acts } = await supabase.from("kids_academy_activity_log").select("*").eq("parent_id", userId).gte("created_at", weekStart.toISOString());
        const { data: xps } = await supabase.from("kids_academy_xp").select("*").eq("parent_id", userId);
        const digest = await callAI([
          { role: "system", content: "Write a warm weekly digest for a parent about their children's learning. Return JSON { summary, highlights:[], concerns:[], suggestions:[] }." },
          { role: "user", content: `Children XP: ${JSON.stringify(xps ?? [])}\nWeek activity: ${JSON.stringify(acts ?? [])}` },
        ]);
        const ws = weekStart.toISOString().slice(0, 10);
        await supabase.from("kids_academy_parent_digest").upsert({ parent_id: userId, week_start: ws, summary_json: digest }, { onConflict: "parent_id,week_start" });
        return ok({ digest, week_start: ws });
      }

      default:
        return ok({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg === "RATE_LIMIT" ? 429 : msg === "AI_CREDITS_EXHAUSTED" ? 402 : 500;
    return ok({ error: msg }, status);
  }
});
