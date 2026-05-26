import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const AI_KEY = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization") || "";
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: auth } },
    });
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

    const { data: ud } = await userClient.auth.getUser();
    const user = ud?.user;
    if (!user) return json({ error: "unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const action: string = body.action || "";

    const ensureChild = async (childId: string) => {
      const { data } = await admin.from("kids_child_profiles").select("id,parent_id").eq("id", childId).maybeSingle();
      if (!data || data.parent_id !== user.id) throw new Error("forbidden");
    };

    switch (action) {
      // --- Children ---
      case "children.list": {
        const { data } = await admin.from("kids_child_profiles").select("*").eq("parent_id", user.id).order("created_at");
        return json({ children: data || [] });
      }
      case "children.create": {
        const { name, age, avatar, pet } = body;
        if (!name || !age) return json({ error: "name and age required" }, 400);
        const { data, error } = await admin.from("kids_child_profiles").insert({
          parent_id: user.id, name, age, avatar: avatar || "fox", pet: pet || "cat",
        }).select().single();
        if (error) return json({ error: error.message }, 400);
        const band = age <= 8 ? "6-8" : age <= 10 ? "9-10" : "11-12";
        await admin.from("kids_age_bands").insert({ child_id: data.id, band });
        await admin.from("kids_economy").insert({ child_id: data.id });
        await admin.from("kids_screen_time_rules").insert({ child_id: data.id });
        await admin.from("kids_narration_prefs").insert({ child_id: data.id });
        return json({ child: data });
      }
      case "children.update": {
        const { id, ...patch } = body;
        await ensureChild(id);
        const { data, error } = await admin.from("kids_child_profiles").update(patch).eq("id", id).select().single();
        if (error) return json({ error: error.message }, 400);
        return json({ child: data });
      }
      case "children.delete": {
        await ensureChild(body.id);
        await admin.from("kids_child_profiles").delete().eq("id", body.id);
        return json({ ok: true });
      }

      // --- Learning path (daily) ---
      case "path.today": {
        await ensureChild(body.child_id);
        const today = new Date().toISOString().slice(0, 10);
        let { data: path } = await admin
          .from("kids_learning_paths")
          .select("*, kids_learning_path_steps(*)")
          .eq("child_id", body.child_id).eq("day_date", today).maybeSingle();
        if (!path) {
          const themes = ["Space Day","Ocean Day","Math Quest","Story Magic","Nature Lab"];
          const theme = themes[new Date().getDay() % themes.length];
          const { data: created } = await admin.from("kids_learning_paths").insert({
            child_id: body.child_id, day_date: today, theme,
          }).select().single();
          const steps = [
            { title: "Warm-up: Phonics", kind: "minigame", payload: { game: "phonics" } },
            { title: "Read a Story", kind: "story", payload: { topic: theme } },
            { title: "Math Quest", kind: "minigame", payload: { game: "math" } },
            { title: "Science Spark", kind: "video", payload: { topic: theme } },
            { title: "Reflect & Earn", kind: "reflect", payload: {} },
          ].map((s, i) => ({ path_id: created.id, position: i, ...s }));
          await admin.from("kids_learning_path_steps").insert(steps);
          const { data: full } = await admin.from("kids_learning_paths")
            .select("*, kids_learning_path_steps(*)").eq("id", created.id).single();
          path = full;
        }
        return json({ path });
      }
      case "path.complete_step": {
        const { step_id } = body;
        const { data: step } = await admin.from("kids_learning_path_steps").select("*, kids_learning_paths(child_id)").eq("id", step_id).single();
        if (!step) return json({ error: "not found" }, 404);
        // @ts-ignore
        await ensureChild(step.kids_learning_paths.child_id);
        await admin.from("kids_learning_path_steps").update({ completed: true, completed_at: new Date().toISOString() }).eq("id", step_id);
        // award xp/coins
        // @ts-ignore
        await awardEconomy(admin, step.kids_learning_paths.child_id, 10, 5);
        return json({ ok: true });
      }

      // --- Saved / offline ---
      case "saved.list": {
        await ensureChild(body.child_id);
        const { data } = await admin.from("kids_saved_content").select("*").eq("child_id", body.child_id).order("saved_at", { ascending: false });
        return json({ items: data || [] });
      }
      case "saved.add": {
        await ensureChild(body.child_id);
        const { data, error } = await admin.from("kids_saved_content").insert({
          child_id: body.child_id, kind: body.kind, title: body.title, payload: body.payload || {},
        }).select().single();
        if (error) return json({ error: error.message }, 400);
        return json({ item: data });
      }
      case "saved.remove": {
        const { data: item } = await admin.from("kids_saved_content").select("child_id").eq("id", body.id).single();
        if (item) { await ensureChild(item.child_id); await admin.from("kids_saved_content").delete().eq("id", body.id); }
        return json({ ok: true });
      }

      // --- Activity log + Parental reports ---
      case "activity.log": {
        await ensureChild(body.child_id);
        await admin.from("kids_activity_log").insert({
          child_id: body.child_id, topic: body.topic, duration_seconds: body.duration_seconds || 0, score: body.score ?? null,
        });
        return json({ ok: true });
      }
      case "reports.summary": {
        await ensureChild(body.child_id);
        const since = new Date(Date.now() - 7 * 86400000).toISOString();
        const { data: logs } = await admin.from("kids_activity_log").select("*").eq("child_id", body.child_id).gte("created_at", since);
        const byTopic: Record<string, { seconds: number; count: number; avg_score: number; scores: number[] }> = {};
        let total = 0;
        for (const l of logs || []) {
          total += l.duration_seconds;
          const t = byTopic[l.topic] ||= { seconds: 0, count: 0, avg_score: 0, scores: [] };
          t.seconds += l.duration_seconds; t.count += 1;
          if (l.score != null) t.scores.push(l.score);
        }
        for (const t of Object.values(byTopic)) t.avg_score = t.scores.length ? Math.round(t.scores.reduce((a,b)=>a+b,0)/t.scores.length) : 0;
        return json({ total_seconds: total, by_topic: byTopic, sample_count: (logs||[]).length });
      }

      // --- Screen time ---
      case "screen.get": {
        await ensureChild(body.child_id);
        const { data } = await admin.from("kids_screen_time_rules").select("*").eq("child_id", body.child_id).maybeSingle();
        const today = new Date().toISOString().slice(0,10) + "T00:00:00Z";
        const { data: logs } = await admin.from("kids_activity_log").select("duration_seconds").eq("child_id", body.child_id).gte("created_at", today);
        const used = (logs||[]).reduce((a,b)=>a+b.duration_seconds,0);
        return json({ rules: data, used_seconds: used });
      }
      case "screen.update": {
        await ensureChild(body.child_id);
        const { data, error } = await admin.from("kids_screen_time_rules").upsert({
          child_id: body.child_id,
          daily_minutes: body.daily_minutes,
          bedtime_start: body.bedtime_start,
          bedtime_end: body.bedtime_end,
          hard_lock: body.hard_lock,
          updated_at: new Date().toISOString(),
        }).select().single();
        if (error) return json({ error: error.message }, 400);
        return json({ rules: data });
      }

      // --- Curriculum ---
      case "curriculum.get": {
        await ensureChild(body.child_id);
        const { data } = await admin.from("kids_curriculum_progress").select("*").eq("child_id", body.child_id);
        return json({ progress: data || [] });
      }
      case "curriculum.bump": {
        await ensureChild(body.child_id);
        const subject = body.subject as string;
        const { data: cur } = await admin.from("kids_curriculum_progress").select("*").eq("child_id", body.child_id).eq("subject", subject).maybeSingle();
        const xp = (cur?.xp || 0) + (body.xp || 10);
        const level = Math.max(cur?.level || 1, Math.floor(xp / 100) + 1);
        const { data, error } = await admin.from("kids_curriculum_progress").upsert({
          child_id: body.child_id, subject, xp, level, updated_at: new Date().toISOString(),
        }, { onConflict: "child_id,subject" }).select().single();
        if (error) return json({ error: error.message }, 400);
        return json({ progress: data });
      }

      // --- Age bands ---
      case "age_band.get": {
        await ensureChild(body.child_id);
        const { data } = await admin.from("kids_age_bands").select("*").eq("child_id", body.child_id).maybeSingle();
        return json({ band: data });
      }
      case "age_band.update": {
        await ensureChild(body.child_id);
        const { data, error } = await admin.from("kids_age_bands").upsert({
          child_id: body.child_id, band: body.band, allow_videos: body.allow_videos, allow_ai_chat: body.allow_ai_chat, updated_at: new Date().toISOString(),
        }).select().single();
        if (error) return json({ error: error.message }, 400);
        return json({ band: data });
      }

      // --- Safety ---
      case "safety.get": {
        const { data } = await admin.from("kids_safety_flags").select("*").eq("parent_id", user.id).maybeSingle();
        return json({ safety: data || { parent_id: user.id, block_violence: true, block_scary: true, block_external_links: true, block_unknown_topics: false, custom_blocklist: [] } });
      }
      case "safety.update": {
        const { data, error } = await admin.from("kids_safety_flags").upsert({
          parent_id: user.id,
          block_violence: body.block_violence,
          block_scary: body.block_scary,
          block_external_links: body.block_external_links,
          block_unknown_topics: body.block_unknown_topics,
          custom_blocklist: body.custom_blocklist || [],
          updated_at: new Date().toISOString(),
        }).select().single();
        if (error) return json({ error: error.message }, 400);
        return json({ safety: data });
      }

      // --- Recommendations (AI or heuristic) ---
      case "recs.list": {
        await ensureChild(body.child_id);
        const { data } = await admin.from("kids_recommendations").select("*").eq("child_id", body.child_id).order("created_at", { ascending: false }).limit(10);
        if ((data || []).length > 0) return json({ recs: data });
        // seed defaults
        const seed = [
          { title: "Try Phonics Quest", reason: "Build reading fluency", target_route: "/kids-channel/hub/phonics" },
          { title: "Math Mini-Game", reason: "Practice addition", target_route: "/kids-channel/hub/math" },
          { title: "Story Time", reason: "Imagination boost", target_route: "/kids-story-creator" },
        ];
        const inserted = await admin.from("kids_recommendations").insert(seed.map(s => ({ ...s, child_id: body.child_id }))).select();
        return json({ recs: inserted.data || [] });
      }
      case "recs.generate": {
        await ensureChild(body.child_id);
        let recs: any[] = [];
        if (AI_KEY) {
          try {
            const r = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${AI_KEY}` },
              body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{
                  role: "user",
                  content: `Suggest 4 short kid-safe learning activities for age ${body.age || 8}. Reply JSON array [{title,reason,target_route}].`,
                }],
              }),
            });
            const j = await r.json();
            const text = j.choices?.[0]?.message?.content || "[]";
            const m = text.match(/\[[\s\S]*\]/);
            recs = m ? JSON.parse(m[0]) : [];
          } catch (_) { /* ignore */ }
        }
        if (recs.length === 0) {
          recs = [{ title: "Read a story", reason: "Daily reading", target_route: "/kids-story-creator" }];
        }
        await admin.from("kids_recommendations").insert(recs.map(r => ({
          child_id: body.child_id, title: r.title, reason: r.reason, target_route: r.target_route || "/kids-channel/hub",
        })));
        const { data } = await admin.from("kids_recommendations").select("*").eq("child_id", body.child_id).order("created_at", { ascending: false }).limit(10);
        return json({ recs: data || [] });
      }

      // --- Pending AI outputs (approval) ---
      case "approval.submit": {
        await ensureChild(body.child_id);
        const { data, error } = await admin.from("kids_pending_outputs").insert({
          child_id: body.child_id, kind: body.kind, content: body.content,
        }).select().single();
        if (error) return json({ error: error.message }, 400);
        return json({ item: data });
      }
      case "approval.list": {
        const { data } = await admin.from("kids_pending_outputs").select("*, kids_child_profiles!inner(parent_id,name)").eq("kids_child_profiles.parent_id", user.id).order("created_at", { ascending: false });
        return json({ items: data || [] });
      }
      case "approval.review": {
        const { data: item } = await admin.from("kids_pending_outputs").select("child_id").eq("id", body.id).single();
        if (item) await ensureChild(item.child_id);
        await admin.from("kids_pending_outputs").update({ status: body.status, reviewed_at: new Date().toISOString() }).eq("id", body.id);
        return json({ ok: true });
      }

      // --- Narration ---
      case "narration.get": {
        await ensureChild(body.child_id);
        const { data } = await admin.from("kids_narration_prefs").select("*").eq("child_id", body.child_id).maybeSingle();
        return json({ prefs: data });
      }
      case "narration.update": {
        await ensureChild(body.child_id);
        const { data, error } = await admin.from("kids_narration_prefs").upsert({
          child_id: body.child_id, voice: body.voice, speed: body.speed, auto_read: body.auto_read, updated_at: new Date().toISOString(),
        }).select().single();
        if (error) return json({ error: error.message }, 400);
        return json({ prefs: data });
      }

      // --- Mini games ---
      case "minigame.submit": {
        await ensureChild(body.child_id);
        await admin.from("kids_minigame_scores").insert({
          child_id: body.child_id, game: body.game, score: body.score, max_score: body.max_score,
        });
        // adaptive difficulty
        const pct = body.max_score ? body.score / body.max_score : 0;
        const { data: cur } = await admin.from("kids_difficulty_state").select("*").eq("child_id", body.child_id).eq("subject", body.game).maybeSingle();
        const newDiff = Math.max(1, Math.min(10, (cur?.difficulty || 1) + (pct >= 0.8 ? 1 : pct <= 0.4 ? -1 : 0)));
        await admin.from("kids_difficulty_state").upsert({
          child_id: body.child_id, subject: body.game, difficulty: newDiff,
          streak: (cur?.streak || 0) + (pct >= 0.6 ? 1 : 0), updated_at: new Date().toISOString(),
        }, { onConflict: "child_id,subject" });
        await awardEconomy(admin, body.child_id, body.score, Math.round(body.score / 2));
        await admin.from("kids_activity_log").insert({ child_id: body.child_id, topic: body.game, duration_seconds: body.duration_seconds || 60, score: body.score });
        return json({ ok: true, new_difficulty: newDiff });
      }
      case "minigame.history": {
        await ensureChild(body.child_id);
        const { data } = await admin.from("kids_minigame_scores").select("*").eq("child_id", body.child_id).order("created_at", { ascending: false }).limit(20);
        return json({ scores: data || [] });
      }

      // --- Difficulty ---
      case "difficulty.get": {
        await ensureChild(body.child_id);
        const { data } = await admin.from("kids_difficulty_state").select("*").eq("child_id", body.child_id);
        return json({ state: data || [] });
      }

      // --- Economy ---
      case "economy.get": {
        await ensureChild(body.child_id);
        const { data } = await admin.from("kids_economy").select("*").eq("child_id", body.child_id).maybeSingle();
        return json({ economy: data });
      }

      // --- Assignments ---
      case "assignments.list": {
        const { data } = await admin.from("kids_assignments").select("*, kids_child_profiles(name)").eq("parent_id", user.id).order("created_at", { ascending: false });
        return json({ items: data || [] });
      }
      case "assignments.create": {
        await ensureChild(body.child_id);
        const { data, error } = await admin.from("kids_assignments").insert({
          parent_id: user.id, child_id: body.child_id, title: body.title, description: body.description,
          due_date: body.due_date, reward_coins: body.reward_coins || 10,
        }).select().single();
        if (error) return json({ error: error.message }, 400);
        return json({ item: data });
      }
      case "assignments.complete": {
        const { data: a } = await admin.from("kids_assignments").select("*").eq("id", body.id).eq("parent_id", user.id).maybeSingle();
        if (!a) return json({ error: "not found" }, 404);
        await admin.from("kids_assignments").update({ status: "done" }).eq("id", body.id);
        await admin.from("kids_assignment_submissions").insert({ assignment_id: body.id, note: body.note || "" });
        await awardEconomy(admin, a.child_id, 0, a.reward_coins);
        return json({ ok: true });
      }
      case "assignments.delete": {
        await admin.from("kids_assignments").delete().eq("id", body.id).eq("parent_id", user.id);
        return json({ ok: true });
      }

      // --- Family shares ---
      case "shares.list": {
        const { data } = await admin.from("kids_family_shares").select("*").eq("parent_id", user.id).order("created_at", { ascending: false });
        return json({ items: data || [] });
      }
      case "shares.create": {
        await ensureChild(body.child_id);
        const { data, error } = await admin.from("kids_family_shares").insert({
          parent_id: user.id, child_id: body.child_id, kind: body.kind, title: body.title, payload: body.payload || {},
          expires_at: body.expires_at || null,
        }).select().single();
        if (error) return json({ error: error.message }, 400);
        return json({ item: data });
      }
      case "shares.revoke": {
        await admin.from("kids_family_shares").delete().eq("id", body.id).eq("parent_id", user.id);
        return json({ ok: true });
      }
      case "shares.public_get": {
        const { data } = await admin.from("kids_family_shares").select("kind,title,payload,created_at,expires_at").eq("share_token", body.token).maybeSingle();
        if (!data) return json({ error: "not found" }, 404);
        if (data.expires_at && new Date(data.expires_at) < new Date()) return json({ error: "expired" }, 410);
        return json({ item: data });
      }

      default:
        return json({ error: `unknown action: ${action}` }, 400);
    }
  } catch (e) {
    return json({ error: (e as Error).message || String(e) }, 500);
  }
});

async function awardEconomy(admin: any, child_id: string, xp: number, coins: number) {
  const { data: cur } = await admin.from("kids_economy").select("*").eq("child_id", child_id).maybeSingle();
  const today = new Date().toISOString().slice(0, 10);
  const last = cur?.last_active_date;
  let streak = cur?.streak_days || 0;
  if (last !== today) {
    const yest = new Date(Date.now() - 86400000).toISOString().slice(0,10);
    streak = last === yest ? streak + 1 : 1;
  }
  await admin.from("kids_economy").upsert({
    child_id,
    xp: (cur?.xp || 0) + xp,
    coins: (cur?.coins || 0) + coins,
    streak_days: streak,
    last_active_date: today,
    updated_at: new Date().toISOString(),
  });
}
