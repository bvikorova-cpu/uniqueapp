// Personal Mentor universal router — handles all 18 features
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const MENTOR_PRICES: Record<string, string> = {
  monthly: "price_1TXnOuGaXSfGtYFtNzPlq3GN",
  yearly: "price_1TXnOvGaXSfGtYFtxGWrODSu",
};

const MENTOR_PRICE_TO_PLAN: Record<string, string> = {
  price_1TXnOuGaXSfGtYFtNzPlq3GN: "monthly",
  price_1TXnOvGaXSfGtYFtxGWrODSu: "yearly",
};

function json(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function ai(messages: any[], opts: { model?: string; jsonMode?: boolean } = {}) {
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: opts.model ?? "google/gemini-2.5-flash",
      messages,
      ...(opts.jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!r.ok) throw new Error(`AI ${r.status}: ${await r.text()}`);
  const d = await r.json();
  return d.choices?.[0]?.message?.content ?? "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action as string;
    if (!action) return json({ error: "action required" }, 400);

    const authHeader = req.headers.get("Authorization");
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Public action: submit 360 response by token
    if (action === "feedback360.submit") {
      const { token, responses, relationship } = body;
      if (!token || !responses) return json({ error: "missing" }, 400);
      const { data: req360 } = await admin.from("mentor_360_requests").select("id, status, expires_at").eq("token", token).maybeSingle();
      if (!req360) return json({ error: "invalid token" }, 404);
      if (req360.status !== "open" || new Date(req360.expires_at) < new Date()) return json({ error: "closed" }, 410);
      const { error } = await admin.from("mentor_360_responses").insert({ request_id: req360.id, responses, relationship: relationship ?? null });
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }
    if (action === "feedback360.get_by_token") {
      const { token } = body;
      const { data } = await admin.from("mentor_360_requests").select("id, questions, status, expires_at").eq("token", token).maybeSingle();
      if (!data) return json({ error: "not found" }, 404);
      return json({ request: data });
    }

    // Authed actions below
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader ?? "" } },
    });
    const { data: u } = await userClient.auth.getUser();
    const user = u?.user;
    if (!user && action === "premium.check") return json({ subscribed: false });
    if (!user) return json({ error: "unauthorized" }, 401);
    const userId = user.id;

    switch (action) {
      case "premium.checkout": {
        const plan = body.plan === "yearly" ? "yearly" : "monthly";
        const area = ["career", "fitness", "mindset", "relationships"].includes(body.area) ? body.area : "career";
        const priceId = MENTOR_PRICES[plan];
        if (!user.email) return json({ error: "email required" }, 400);
        const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
        if (!stripeKey) return json({ error: "Stripe is not configured" }, 500);
        const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
        const customers = await stripe.customers.list({ email: user.email, limit: 1 });
        const customerId = customers.data[0]?.id;

        // Block duplicate subscription for the same area
        if (customerId) {
          const existing = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 50 });
          const dupe = existing.data.find((s) => (s.metadata?.mentor_area === area) && MENTOR_PRICE_TO_PLAN[s.items.data[0]?.price.id]);
          if (dupe) return json({ error: `You already have an active ${area} coach subscription.` }, 409);
        }

        const origin = req.headers.get("origin") || "https://uniqueapp.fun";
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          customer_email: customerId ? undefined : user.email,
          line_items: [{ price: priceId, quantity: 1 }],
          mode: "subscription",
          success_url: `${origin}/ai-mentor/premium?status=success&area=${area}`,
          cancel_url: `${origin}/ai-mentor/premium?status=cancel`,
          metadata: { user_id: userId, plan, mentor_area: area },
          subscription_data: { metadata: { user_id: userId, plan, mentor_area: area } },
        });
        return json({ url: session.url });
      }
      case "premium.check": {
        // Returns map of per-area subscriptions, plus aggregate `subscribed` if any area is active
        const requestedArea = body.area as string | undefined;
        // Beta tester bypass — grants all 4 areas for QA accounts
        const TEST_USERS = ["beata.vikorova@yandex.com"];
        if (user.email && TEST_USERS.includes(user.email.toLowerCase())) {
          const periodEnd = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();
          const allAreas: Record<string, any> = {};
          for (const a of ["career", "fitness", "mindset", "relationships"]) {
            allAreas[a] = { subscribed: true, plan: "yearly", current_period_end: periodEnd, subscription_id: "beta_test" };
          }
          if (requestedArea) return json({ subscribed: true, ...allAreas[requestedArea], areas: allAreas });
          return json({ subscribed: true, areas: allAreas });
        }
        if (!user.email) return json({ subscribed: false, areas: {} });
        const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
        if (!stripeKey) return json({ subscribed: false, areas: {}, error: "Stripe is not configured" }, 200);
        const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
        const customers = await stripe.customers.list({ email: user.email, limit: 1 });
        if (!customers.data.length) return json({ subscribed: false, areas: {} });
        const customerId = customers.data[0].id;
        const subs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 50 });
        const areas: Record<string, { subscribed: boolean; plan: string; current_period_end: string; subscription_id: string }> = {};
        for (const s of subs.data) {
          const item = s.items.data.find((i) => MENTOR_PRICE_TO_PLAN[i.price.id]);
          if (!item) continue;
          const a = (s.metadata?.mentor_area as string) || "career";
          const plan = MENTOR_PRICE_TO_PLAN[item.price.id];
          const periodEnd = new Date((s as any).current_period_end * 1000).toISOString();
          areas[a] = { subscribed: true, plan, current_period_end: periodEnd, subscription_id: s.id };
          await admin.from("mentor_premium_subs").upsert({
            user_id: userId, email: user.email, area: a,
            stripe_customer_id: customerId, stripe_subscription_id: s.id,
            status: "active", plan, current_period_end: periodEnd,
          }, { onConflict: "user_id,area" });
        }
        if (requestedArea) {
          const a = areas[requestedArea];
          return json({ subscribed: !!a, ...(a ?? {}), areas });
        }
        return json({ subscribed: Object.keys(areas).length > 0, areas });
      }

      // ───── 1. MEMORY ─────
      case "memory.upsert": {
        const { area, fact_key, fact_value, importance } = body;
        const { error } = await admin
          .from("mentor_conversation_memory")
          .upsert({ user_id: userId, area, fact_key, fact_value, importance: importance ?? 1 }, { onConflict: "user_id,area,fact_key" });
        if (error) return json({ error: error.message }, 500);
        return json({ ok: true });
      }
      case "memory.list": {
        const { area } = body;
        let q = admin.from("mentor_conversation_memory").select("*").eq("user_id", userId);
        if (area) q = q.eq("area", area);
        const { data } = await q.order("importance", { ascending: false }).limit(50);
        return json({ memory: data ?? [] });
      }
      case "memory.extract_and_save": {
        // Pull facts from a conversation; store top items
        const { area, transcript } = body;
        const sys = `Extract up to 6 long-term user facts from the conversation worth remembering for future sessions. Return JSON {facts:[{key,value,importance(1-5)}]}.`;
        const txt = await ai(
          [
            { role: "system", content: sys },
            { role: "user", content: `Area: ${area}\nConversation:\n${transcript}` },
          ],
          { jsonMode: true }
        );
        let parsed: any = {};
        try { parsed = JSON.parse(txt); } catch {}
        const facts = (parsed.facts ?? []).slice(0, 6);
        if (facts.length) {
          await admin.from("mentor_conversation_memory").upsert(
            facts.map((f: any) => ({ user_id: userId, area, fact_key: String(f.key).slice(0, 80), fact_value: String(f.value).slice(0, 500), importance: Math.min(5, Math.max(1, Number(f.importance) || 1)) })),
            { onConflict: "user_id,area,fact_key" }
          );
        }
        return json({ saved: facts.length });
      }

      // ───── 2. SKILLS ─────
      case "skills.list_with_progress": {
        const [{ data: skills }, { data: progress }] = await Promise.all([
          admin.from("mentor_skills").select("*").order("display_order"),
          admin.from("mentor_user_skill_progress").select("*").eq("user_id", userId),
        ]);
        const map = new Map((progress ?? []).map((p: any) => [p.skill_id, p]));
        return json({ skills: (skills ?? []).map((s: any) => ({ ...s, progress: map.get(s.id) ?? null })) });
      }
      case "skills.practice": {
        const { skill_id, score_delta } = body;
        const { data: existing } = await admin
          .from("mentor_user_skill_progress")
          .select("*")
          .eq("user_id", userId).eq("skill_id", skill_id).maybeSingle();
        const newScore = Math.min(100, Math.max(0, (existing?.score ?? 0) + (score_delta ?? 5)));
        const history = [...((existing?.history as any[]) ?? []), { at: new Date().toISOString(), score: newScore }].slice(-30);
        await admin.from("mentor_user_skill_progress").upsert({
          user_id: userId, skill_id,
          score: newScore,
          practice_count: (existing?.practice_count ?? 0) + 1,
          last_practiced_at: new Date().toISOString(),
          history,
        }, { onConflict: "user_id,skill_id" });
        return json({ score: newScore });
      }

      // ───── 3. PERSONALITY ─────
      case "personality.submit": {
        const { type, answers } = body;
        // Compute Big Five scores; answers = array of {trait, value 1-5}
        const buckets: Record<string, number[]> = {};
        for (const a of answers ?? []) {
          (buckets[a.trait] = buckets[a.trait] ?? []).push(Number(a.value) || 0);
        }
        const result: Record<string, number> = {};
        for (const [k, v] of Object.entries(buckets)) {
          result[k] = Math.round((v.reduce((s, x) => s + x, 0) / v.length) * 20);
        }
        const sys = `You are a personality coach. Given Big Five percentile scores, write 3-paragraph actionable insights and how to leverage strengths.`;
        const insights = await ai([
          { role: "system", content: sys },
          { role: "user", content: JSON.stringify(result) },
        ]);
        const { data } = await admin.from("mentor_personality_assessments").insert({
          user_id: userId, type, result, insights,
        }).select().single();
        return json({ assessment: data });
      }
      case "personality.latest": {
        const { data } = await admin.from("mentor_personality_assessments").select("*").eq("user_id", userId).order("completed_at", { ascending: false }).limit(1).maybeSingle();
        return json({ assessment: data });
      }

      // ───── 4. ROLE-PLAY ─────
      case "roleplay.list": {
        const { data } = await admin.from("mentor_roleplay_scenarios").select("*").order("display_order");
        return json({ scenarios: data ?? [] });
      }
      case "roleplay.start": {
        const { scenario_id } = body;
        const { data: scenario } = await admin.from("mentor_roleplay_scenarios").select("*").eq("id", scenario_id).maybeSingle();
        if (!scenario) return json({ error: "scenario not found" }, 404);
        const { data: session } = await admin.from("mentor_roleplay_sessions").insert({
          user_id: userId, scenario_id, transcript: [],
        }).select().single();
        const opener = await ai([
          { role: "system", content: scenario.system_prompt },
          { role: "user", content: "Open the role-play with your first line as the character. One paragraph max." },
        ]);
        const transcript = [{ role: "assistant", content: opener }];
        await admin.from("mentor_roleplay_sessions").update({ transcript }).eq("id", session.id);
        return json({ session_id: session.id, transcript, scenario });
      }
      case "roleplay.reply": {
        const { session_id, user_message } = body;
        const { data: session } = await admin.from("mentor_roleplay_sessions").select("*, scenario:mentor_roleplay_scenarios(*)").eq("id", session_id).eq("user_id", userId).maybeSingle();
        if (!session) return json({ error: "not found" }, 404);
        const messages = [
          { role: "system", content: (session as any).scenario.system_prompt },
          ...((session.transcript as any[]) ?? []),
          { role: "user", content: user_message },
        ];
        const reply = await ai(messages);
        const transcript = [...((session.transcript as any[]) ?? []), { role: "user", content: user_message }, { role: "assistant", content: reply }];
        await admin.from("mentor_roleplay_sessions").update({ transcript }).eq("id", session_id);
        return json({ reply, transcript });
      }
      case "roleplay.complete": {
        const { session_id } = body;
        const { data: session } = await admin.from("mentor_roleplay_sessions").select("*, scenario:mentor_roleplay_scenarios(*)").eq("id", session_id).eq("user_id", userId).maybeSingle();
        if (!session) return json({ error: "not found" }, 404);
        const sc = (session as any).scenario;
        const evalSys = `Evaluate the user's performance in this role-play against criteria: ${JSON.stringify(sc.evaluation_criteria)}. Return JSON {score:0-100, feedback:"3-paragraph constructive feedback"}.`;
        const out = await ai([
          { role: "system", content: evalSys },
          { role: "user", content: JSON.stringify(session.transcript) },
        ], { jsonMode: true });
        let parsed: any = { score: 70, feedback: out };
        try { parsed = JSON.parse(out); } catch {}
        await admin.from("mentor_roleplay_sessions").update({ completed: true, score: parsed.score, feedback: parsed.feedback }).eq("id", session_id);
        return json({ score: parsed.score, feedback: parsed.feedback });
      }

      // ───── 5. 360 FEEDBACK ─────
      case "feedback360.create": {
        const { questions } = body;
        const { data, error } = await admin.from("mentor_360_requests").insert({
          user_id: userId,
          questions: questions ?? [
            "What are my top 3 strengths?",
            "What is one blind spot I should work on?",
            "How do I show up in stressful moments?",
            "What would you trust me to deliver every time?",
            "One thing I could do differently to help you?",
          ],
        }).select().single();
        if (error) return json({ error: error.message }, 500);
        return json({ request: data });
      }
      case "feedback360.list": {
        const { data: requests } = await admin.from("mentor_360_requests").select("*").eq("user_id", userId).order("created_at", { ascending: false });
        const ids = (requests ?? []).map((r: any) => r.id);
        const { data: responses } = ids.length
          ? await admin.from("mentor_360_responses").select("*").in("request_id", ids)
          : { data: [] as any[] };
        return json({ requests: requests ?? [], responses: responses ?? [] });
      }

      // ───── 6. DAILY NUDGES ─────
      case "nudges.today": {
        const { data } = await admin.from("mentor_daily_nudges").select("*").eq("user_id", userId).eq("sent_for_date", new Date().toISOString().slice(0, 10));
        return json({ nudges: data ?? [] });
      }
      case "nudges.generate": {
        const { area } = body;
        const sys = `You are an AI personal mentor. Write 1 short (under 25 words) daily nudge for the user in the ${area} area. Encouraging, specific, ends with an action.`;
        const msg = await ai([{ role: "system", content: sys }, { role: "user", content: `Generate today's nudge for ${area}.` }]);
        const { data, error } = await admin.from("mentor_daily_nudges").upsert({
          user_id: userId, area, message: msg.trim(), sent_for_date: new Date().toISOString().slice(0, 10),
        }, { onConflict: "user_id,sent_for_date,area" }).select().single();
        if (error) return json({ error: error.message }, 500);
        return json({ nudge: data });
      }
      case "nudges.mark_read": {
        await admin.from("mentor_daily_nudges").update({ read: true }).eq("id", body.id).eq("user_id", userId);
        return json({ ok: true });
      }

      // ───── 7. SMART GOALS ─────
      case "goals.list": {
        const { data: goals } = await admin.from("mentor_smart_goals").select("*").eq("user_id", userId).order("created_at", { ascending: false });
        const ids = (goals ?? []).map((g: any) => g.id);
        const { data: ms } = ids.length
          ? await admin.from("mentor_smart_milestones").select("*").in("goal_id", ids).order("display_order")
          : { data: [] as any[] };
        const byGoal: Record<string, any[]> = {};
        for (const m of ms ?? []) (byGoal[m.goal_id] = byGoal[m.goal_id] ?? []).push(m);
        return json({ goals: (goals ?? []).map((g: any) => ({ ...g, milestones: byGoal[g.id] ?? [] })) });
      }
      case "goals.create": {
        const { area, title, description, deadline } = body;
        // Ask AI to break down SMART + milestones
        const sys = `Given a goal, return JSON {smart_specific, smart_measurable, smart_achievable, smart_relevant, milestones:[{title,due_date(YYYY-MM-DD optional)}]}. Generate 4-6 milestones.`;
        const out = await ai([
          { role: "system", content: sys },
          { role: "user", content: `Goal: ${title}\nArea: ${area}\nDeadline: ${deadline ?? "open"}\nContext: ${description ?? ""}` },
        ], { jsonMode: true });
        let parsed: any = {};
        try { parsed = JSON.parse(out); } catch {}
        const { data: goal, error } = await admin.from("mentor_smart_goals").insert({
          user_id: userId, area, title, description,
          smart_specific: parsed.smart_specific ?? null,
          smart_measurable: parsed.smart_measurable ?? null,
          smart_achievable: parsed.smart_achievable ?? null,
          smart_relevant: parsed.smart_relevant ?? null,
          deadline: deadline ?? null,
        }).select().single();
        if (error) return json({ error: error.message }, 500);
        if (Array.isArray(parsed.milestones)) {
          await admin.from("mentor_smart_milestones").insert(parsed.milestones.slice(0, 8).map((m: any, i: number) => ({
            goal_id: goal.id, title: String(m.title ?? "").slice(0, 200), due_date: m.due_date ?? null, display_order: i,
          })));
        }
        return json({ goal });
      }
      case "goals.toggle_milestone": {
        const { milestone_id, completed } = body;
        const { data: m } = await admin.from("mentor_smart_milestones").select("goal_id").eq("id", milestone_id).maybeSingle();
        if (!m) return json({ error: "not found" }, 404);
        await admin.from("mentor_smart_milestones").update({ completed }).eq("id", milestone_id);
        // Recompute progress
        const { data: all } = await admin.from("mentor_smart_milestones").select("completed").eq("goal_id", m.goal_id);
        const total = all?.length ?? 0;
        const done = (all ?? []).filter((x: any) => x.completed).length;
        const progress = total ? Math.round((done / total) * 100) : 0;
        await admin.from("mentor_smart_goals").update({ progress, status: progress === 100 ? "completed" : "active" }).eq("id", m.goal_id);
        return json({ progress });
      }

      // ───── 8. REFLECTION PROMPTS ─────
      case "prompts.draw": {
        const { area, mood } = body;
        let q = admin.from("mentor_reflection_prompts").select("*");
        if (area) q = q.eq("area", area);
        if (mood) q = q.eq("mood", mood);
        const { data } = await q;
        const pick = (data ?? [])[Math.floor(Math.random() * Math.max(1, (data ?? []).length))];
        return json({ prompt: pick ?? null });
      }

      // ───── 9. HABITS ─────
      case "habits.list": {
        const [{ data: habits }, { data: logs }] = await Promise.all([
          admin.from("mentor_habits").select("*").eq("user_id", userId).eq("archived", false).order("created_at"),
          admin.from("mentor_habit_logs").select("habit_id, log_date, completed").eq("user_id", userId).gte("log_date", new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)),
        ]);
        return json({ habits: habits ?? [], logs: logs ?? [] });
      }
      case "habits.create": {
        const { title, area, frequency } = body;
        const { data, error } = await admin.from("mentor_habits").insert({ user_id: userId, title, area, frequency: frequency ?? "daily" }).select().single();
        if (error) return json({ error: error.message }, 500);
        return json({ habit: data });
      }
      case "habits.log": {
        const { habit_id, completed, note } = body;
        const today = new Date().toISOString().slice(0, 10);
        const { data: h } = await admin.from("mentor_habits").select("*").eq("id", habit_id).eq("user_id", userId).maybeSingle();
        if (!h) return json({ error: "not found" }, 404);
        await admin.from("mentor_habit_logs").upsert({ habit_id, user_id: userId, log_date: today, completed: !!completed, note: note ?? null }, { onConflict: "habit_id,log_date" });
        // Recompute streak
        const { data: logs } = await admin.from("mentor_habit_logs").select("log_date, completed, used_freeze").eq("habit_id", habit_id).order("log_date", { ascending: false }).limit(60);
        let streak = 0;
        const todayD = new Date();
        for (let i = 0; i < 60; i++) {
          const d = new Date(todayD); d.setDate(d.getDate() - i);
          const ds = d.toISOString().slice(0, 10);
          const lg = (logs ?? []).find((l: any) => l.log_date === ds);
          if (lg && (lg.completed || lg.used_freeze)) streak++;
          else break;
        }
        await admin.from("mentor_habits").update({
          current_streak: streak,
          best_streak: Math.max(streak, h.best_streak ?? 0),
        }).eq("id", habit_id);
        return json({ streak });
      }
      case "habits.use_freeze": {
        const { habit_id } = body;
        const { data: h } = await admin.from("mentor_habits").select("*").eq("id", habit_id).eq("user_id", userId).maybeSingle();
        if (!h || (h.freeze_tokens ?? 0) < 1) return json({ error: "no freeze tokens" }, 400);
        const today = new Date().toISOString().slice(0, 10);
        await admin.from("mentor_habit_logs").upsert({ habit_id, user_id: userId, log_date: today, completed: false, used_freeze: true }, { onConflict: "habit_id,log_date" });
        await admin.from("mentor_habits").update({ freeze_tokens: (h.freeze_tokens ?? 0) - 1 }).eq("id", habit_id);
        return json({ ok: true });
      }

      // ───── 10. COACH PERSONALITIES ─────
      case "coach.list": {
        const { data } = await admin.from("mentor_coach_personalities").select("*").order("name");
        return json({ coaches: data ?? [] });
      }
      case "coach.chat": {
        const { coach_slug, area, message, history } = body;
        const [{ data: coach }, { data: memory }] = await Promise.all([
          admin.from("mentor_coach_personalities").select("*").eq("slug", coach_slug).maybeSingle(),
          admin.from("mentor_conversation_memory").select("fact_key, fact_value").eq("user_id", userId).eq("area", area ?? "mindset").limit(20),
        ]);
        if (!coach) return json({ error: "coach not found" }, 404);
        const memText = (memory ?? []).map((m: any) => `- ${m.fact_key}: ${m.fact_value}`).join("\n");
        const sys = `${coach.system_prompt}\n\nUser long-term memory for area "${area}":\n${memText || "(none yet)"}`;
        const msgs = [
          { role: "system", content: sys },
          ...((history ?? []) as any[]),
          { role: "user", content: message },
        ];
        const reply = await ai(msgs);
        return json({ reply });
      }

      // ───── 11. SESSION SUMMARIES (PDF data) ─────
      case "summary.generate": {
        const { area, transcript } = body;
        const sys = `Summarise this coaching session. Return JSON {summary, commitments:[], key_insights:[], next_steps:[]}.`;
        const out = await ai([{ role: "system", content: sys }, { role: "user", content: `Area: ${area}\n${transcript}` }], { jsonMode: true });
        let parsed: any = { summary: out, commitments: [], key_insights: [], next_steps: [] };
        try { parsed = JSON.parse(out); } catch {}
        const { data } = await admin.from("mentor_session_summaries").insert({
          user_id: userId, area,
          summary: parsed.summary ?? "", commitments: parsed.commitments ?? [], key_insights: parsed.key_insights ?? [], next_steps: parsed.next_steps ?? [],
        }).select().single();
        return json({ summary: data });
      }
      case "summary.list": {
        const { data } = await admin.from("mentor_session_summaries").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(30);
        return json({ summaries: data ?? [] });
      }

      // ───── 12. VOICE JOURNAL ─────
      case "voice.journal": {
        const { transcript, duration_sec } = body;
        if (!transcript) return json({ error: "missing transcript" }, 400);
        const sys = `Detect dominant emotion (one word: anxious/sad/angry/neutral/hopeful/joyful/grateful) and give 3-bullet insights. Return JSON {emotion, insights}.`;
        const out = await ai([{ role: "system", content: sys }, { role: "user", content: transcript }], { jsonMode: true });
        let parsed: any = { emotion: "neutral", insights: "" };
        try { parsed = JSON.parse(out); } catch {}
        const { data } = await admin.from("mentor_voice_journals").insert({
          user_id: userId, transcript, detected_emotion: parsed.emotion, ai_insights: typeof parsed.insights === "string" ? parsed.insights : JSON.stringify(parsed.insights), duration_sec: duration_sec ?? null,
        }).select().single();
        return json({ entry: data });
      }
      case "voice.list": {
        const { data } = await admin.from("mentor_voice_journals").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
        return json({ entries: data ?? [] });
      }

      // ───── 13. CBT PROGRAMS ─────
      case "cbt.programs": {
        const { data } = await admin.from("mentor_cbt_programs").select("*").order("title");
        const { data: progress } = await admin.from("mentor_cbt_progress").select("*").eq("user_id", userId);
        const map = new Map((progress ?? []).map((p: any) => [p.program_id, p]));
        return json({ programs: (data ?? []).map((p: any) => ({ ...p, progress: map.get(p.id) ?? null })) });
      }
      case "cbt.start": {
        const { program_id } = body;
        const { data, error } = await admin.from("mentor_cbt_progress").upsert({ user_id: userId, program_id, current_day: 1, completed_days: [] }, { onConflict: "user_id,program_id" }).select().single();
        if (error) return json({ error: error.message }, 500);
        return json({ progress: data });
      }
      case "cbt.complete_day": {
        const { program_id, day } = body;
        const { data: p } = await admin.from("mentor_cbt_progress").select("*").eq("user_id", userId).eq("program_id", program_id).maybeSingle();
        if (!p) return json({ error: "not started" }, 404);
        const done = Array.from(new Set([...(p.completed_days as number[] ?? []), day]));
        const { data: prog } = await admin.from("mentor_cbt_programs").select("duration_days").eq("id", program_id).maybeSingle();
        const isDone = done.length >= (prog?.duration_days ?? 21);
        await admin.from("mentor_cbt_progress").update({
          completed_days: done, current_day: Math.min(day + 1, prog?.duration_days ?? 21),
          completed_at: isDone ? new Date().toISOString() : null,
        }).eq("id", p.id);
        return json({ completed: done, done: isDone });
      }

      default:
        return json({ error: `unknown action: ${action}` }, 400);
    }
  } catch (e: any) {
    console.error("mentor-router error", e);
    return json({ error: e?.message ?? "internal" }, 500);
  }
});
