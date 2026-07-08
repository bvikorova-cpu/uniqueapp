// Universal Education edge function - one slot handles all education actions
// Actions: srs.*, daily.*, achievement.*, league.*, cert.*, math.*, notes.*,
//          tutor.*, deck.*, course.* (curriculum/exam/submit/videos/workbook/
//          progress_get/progress_set/feedback)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";
import QRCode from "npm:qrcode@1.5.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ---- per-isolate rate limiter ----
const rlBuckets = new Map<string, { count: number; resetAt: number }>();
function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const b = rlBuckets.get(key);
  if (!b || now > b.resetAt) { rlBuckets.set(key, { count: 1, resetAt: now + windowMs }); return { ok: true, resetIn: windowMs }; }
  if (b.count >= max) return { ok: false, resetIn: b.resetAt - now };
  b.count++; return { ok: true, resetIn: b.resetAt - now };
}

async function aiJsonLovable(system: string, user: string): Promise<any> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      response_format: { type: "json_object" },
    }),
  });
  if (res.status === 402) throw new Error("ai_credits_exhausted");
  if (!res.ok) throw new Error(`ai_error_${res.status}`);
  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content ?? "{}";
  try { return JSON.parse(raw); } catch { const m = raw.match(/\{[\s\S]*\}/); return m ? JSON.parse(m[0]) : {}; }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function callAI(messages: any[], opts: { model?: string; json?: boolean } = {}) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model ?? "gpt-4o-mini",
      messages,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) throw new Error(`AI ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// SM-2 algorithm
function sm2(quality: number, ease: number, interval: number, reps: number) {
  if (quality < 3) {
    return { ease: Math.max(1.3, ease), interval: 1, reps: 0 };
  }
  const newEase = Math.max(1.3, ease + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  let newInterval: number;
  if (reps === 0) newInterval = 1;
  else if (reps === 1) newInterval = 6;
  else newInterval = Math.round(interval * newEase);
  return { ease: newEase, interval: newInterval, reps: reps + 1 };
}

function weekStart(d = new Date()) {
  const day = d.getUTCDay(); // 0 = Sun
  const diff = (day + 6) % 7; // shift to Monday
  const m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - diff));
  return m.toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action as string;
    if (!action) return json({ error: "action required" }, 400);

    const authHeader = req.headers.get("Authorization");
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader ?? "" } },
    });
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "unauthorized" }, 401);

    switch (action) {
      case "srs.due": {
        const limit = Math.min(body.limit ?? 20, 100);
        const { data, error } = await admin
          .from("education_srs_state")
          .select("*, education_flashcards(*)")
          .eq("user_id", user.id)
          .lte("due_at", new Date().toISOString())
          .order("due_at", { ascending: true })
          .limit(limit);
        if (error) throw error;
        return json({ cards: data ?? [] });
      }

      case "srs.review": {
        const cardId = body.card_id as string;
        const quality = Math.max(0, Math.min(5, body.quality ?? 3));
        if (!cardId) return json({ error: "card_id required" }, 400);

        const { data: existing } = await admin
          .from("education_srs_state")
          .select("*")
          .eq("user_id", user.id)
          .eq("card_id", cardId)
          .maybeSingle();

        const prev = existing ?? { ease: 2.5, interval_days: 0, repetitions: 0 };
        const next = sm2(quality, Number(prev.ease), prev.interval_days, prev.repetitions);
        const dueAt = new Date(Date.now() + next.interval * 86400_000).toISOString();

        const { error } = await admin
          .from("education_srs_state")
          .upsert(
            {
              user_id: user.id,
              card_id: cardId,
              ease: next.ease,
              interval_days: next.interval,
              repetitions: next.reps,
              due_at: dueAt,
              last_reviewed_at: new Date().toISOString(),
            },
            { onConflict: "user_id,card_id" }
          );
        if (error) throw error;
        return json({ ok: true, next_due: dueAt, interval: next.interval });
      }

      case "daily.today": {
        const today = new Date().toISOString().slice(0, 10);
        let { data: ch } = await admin
          .from("education_daily_challenges")
          .select("*")
          .eq("challenge_date", today)
          .maybeSingle();

        if (!ch || !ch.payload?.questions || ch.payload.questions.length === 0) {
          // Generate 5 questions from existing quiz_questions pool; if empty, fall back to AI; finally a hardcoded set.
          const { data: pool } = await admin
            .from("quiz_questions")
            .select("question, options, correct_answer, explanation")
            .limit(200);
          let picked = (pool ?? [])
            .sort(() => Math.random() - 0.5)
            .slice(0, 5);

          if (picked.length === 0) {
            try {
              const content = await callAI([
                { role: "system", content: "You generate fun general-knowledge multiple-choice quiz questions. Respond ONLY with JSON." },
                { role: "user", content: 'Return JSON {"questions":[{"question":string,"options":string[4],"correct_answer":string,"explanation":string}]} with exactly 5 varied questions (science, history, geography, arts, sports). correct_answer must be one of the options.' },
              ], { json: true });
              const parsed = JSON.parse(content);
              if (Array.isArray(parsed?.questions)) picked = parsed.questions.slice(0, 5);
            } catch (e) {
              console.error("daily AI fallback failed", e);
            }
          }

          // Hardcoded last-resort fallback so Daily Challenge is never empty
          if (picked.length === 0) {
            picked = [
              { question: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], correct_answer: "Paris", explanation: "Paris has been the capital of France since 987 AD." },
              { question: "What is 7 × 8?", options: ["54", "56", "62", "64"], correct_answer: "56", explanation: "7 × 8 = 56." },
              { question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correct_answer: "Mars", explanation: "Mars appears red due to iron oxide on its surface." },
              { question: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens", "Mark Twain", "William Shakespeare", "Jane Austen"], correct_answer: "William Shakespeare", explanation: "Shakespeare wrote it around 1595." },
              { question: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], correct_answer: "Au", explanation: "Au comes from the Latin 'aurum'." },
            ];
          }

          if (ch) {
            const upd = await admin
              .from("education_daily_challenges")
              .update({ payload: { questions: picked } })
              .eq("id", ch.id)
              .select()
              .single();
            ch = upd.data;
          } else {
            const ins = await admin
              .from("education_daily_challenges")
              .insert({ challenge_date: today, type: "quiz", payload: { questions: picked }, xp_reward: 50 })
              .select()
              .single();
            ch = ins.data;
          }
        }


        const { data: done } = await admin
          .from("education_daily_completions")
          .select("id, score")
          .eq("user_id", user.id)
          .eq("challenge_id", ch.id)
          .maybeSingle();

        return json({ challenge: ch, completed: !!done, score: done?.score ?? null });
      }

      case "daily.submit": {
        const challengeId = body.challenge_id as string;
        const score = Math.max(0, Math.min(100, body.score ?? 0));
        if (!challengeId) return json({ error: "challenge_id required" }, 400);

        // Was today's daily already completed before this submission?
        const { data: alreadyDone } = await admin
          .from("education_daily_completions")
          .select("id")
          .eq("user_id", user.id)
          .eq("challenge_id", challengeId)
          .maybeSingle();

        const { error } = await admin
          .from("education_daily_completions")
          .upsert({ user_id: user.id, challenge_id: challengeId, score }, { onConflict: "user_id,challenge_id" });
        if (error) throw error;

        // Award XP + update daily streak based on daily-challenge completions
        const { data: pts } = await admin
          .from("user_points")
          .select("total_points, login_streak, longest_streak, last_login_date")
          .eq("user_id", user.id)
          .maybeSingle();
        const xpAdd = alreadyDone ? 0 : Math.round((score / 100) * 50);

        const today = new Date().toISOString().slice(0, 10);
        const prevStreak = pts?.login_streak ?? 0;
        let newStreak = prevStreak;

        if (alreadyDone) {
          // Already counted today — keep current streak.
          newStreak = prevStreak > 0 ? prevStreak : 1;
        } else {
          // Find the most recent previously-completed daily (excluding today's).
          const { data: prev } = await admin
            .from("education_daily_completions")
            .select("challenge_id, education_daily_challenges!inner(challenge_date)")
            .eq("user_id", user.id)
            .neq("challenge_id", challengeId)
            .order("completed_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          const prevDate: string | null =
            (prev as any)?.education_daily_challenges?.challenge_date ?? null;

          if (prevDate) {
            const diffDays = Math.round(
              (Date.parse(today) - Date.parse(prevDate)) / 86400000
            );
            newStreak = diffDays === 1 ? prevStreak + 1 : diffDays === 0 ? Math.max(prevStreak, 1) : 1;
          } else {
            newStreak = 1;
          }
        }
        if (newStreak < 1) newStreak = 1;
        const longest = Math.max(pts?.longest_streak ?? 0, newStreak);

        const { error: pointsError } = await admin
          .from("user_points")
          .upsert(
            {
              user_id: user.id,
              total_points: (pts?.total_points ?? 0) + xpAdd,
              login_streak: newStreak,
              longest_streak: longest,
              last_login_date: today,
            },
            { onConflict: "user_id" }
          );
        if (pointsError) throw pointsError;


        // Bump weekly league
        const ws = weekStart();
        const { data: league } = await admin
          .from("education_weekly_leagues")
          .select("xp_this_week")
          .eq("week_start", ws)
          .eq("user_id", user.id)
          .maybeSingle();
        await admin.from("education_weekly_leagues").upsert(
          {
            week_start: ws,
            user_id: user.id,
            xp_this_week: (league?.xp_this_week ?? 0) + xpAdd,
            league_tier: "bronze",
          },
          { onConflict: "week_start,user_id" }
        );

        return json({ ok: true, xp_awarded: xpAdd, streak: newStreak });
      }

      case "league.top": {
        const ws = body.week_start ?? weekStart();
        const tier = body.tier ?? "bronze";
        const { data } = await admin
          .from("education_weekly_leagues")
          .select("user_id, xp_this_week, rank")
          .eq("week_start", ws)
          .eq("league_tier", tier)
          .order("xp_this_week", { ascending: false })
          .limit(30);

        const ids = (data ?? []).map((r) => r.user_id);
        const { data: profiles } = ids.length
          ? await admin.from("profiles").select("id, full_name, avatar_url").in("id", ids)
          : { data: [] as any[] };
        const rows = (data ?? []).map((r, i) => {
          const p = profiles?.find((x: any) => x.id === r.user_id);
          return { ...r, rank: i + 1, full_name: p?.full_name ?? null, avatar_url: p?.avatar_url ?? null };
        });
        return json({ rows, week_start: ws, tier });
      }

      case "achievement.check": {
        // Server-side check of all achievements vs user stats
        const [{ data: ach }, { data: pts }, { data: attempts }, { data: srs }, { data: certs }, { data: groups }, { data: dailyDone }, { data: unlocked }] = await Promise.all([
          admin.from("education_achievements").select("*"),
          admin.from("user_points").select("total_points, login_streak").eq("user_id", user.id).maybeSingle(),
          admin.from("quiz_attempts").select("id, score", { count: "exact" }).eq("user_id", user.id),
          admin.from("education_srs_state").select("repetitions").eq("user_id", user.id),
          admin.from("education_certificates").select("id", { count: "exact" }).eq("user_id", user.id),
          admin.from("education_study_group_members").select("id", { count: "exact" }).eq("user_id", user.id),
          admin.from("education_daily_completions").select("id", { count: "exact" }).eq("user_id", user.id),
          admin.from("education_user_achievements").select("achievement_id").eq("user_id", user.id),
        ]);

        const xp = pts?.total_points ?? 0;
        const streak = pts?.login_streak ?? 0;
        const quizCount = attempts?.length ?? 0;
        const perfect = (attempts ?? []).some((a: any) => a.score === 100);
        const reviews = (srs ?? []).reduce((s: number, r: any) => s + r.repetitions, 0);
        const certCount = certs?.length ?? 0;
        const groupCount = groups?.length ?? 0;
        const dailyCount = dailyDone?.length ?? 0;
        const unlockedIds = new Set((unlocked ?? []).map((u: any) => u.achievement_id));

        const newly: any[] = [];
        for (const a of ach ?? []) {
          if (unlockedIds.has(a.id)) continue;
          const c = a.criteria ?? {};
          const ok =
            (c.quizzes && quizCount >= c.quizzes) ||
            (c.streak && streak >= c.streak) ||
            (c.xp && xp >= c.xp) ||
            (c.reviews && reviews >= c.reviews) ||
            (c.perfect && perfect) ||
            (c.daily && dailyCount >= c.daily) ||
            (c.certs && certCount >= c.certs) ||
            (c.groups && groupCount >= c.groups);
          if (ok) {
            await admin.from("education_user_achievements").insert({ user_id: user.id, achievement_id: a.id });
            newly.push(a);
          }
        }
        return json({ newly_unlocked: newly });
      }

      case "cert.issue": {
        const courseTitle = (body.course_title ?? "Course").toString().slice(0, 200);
        const score = Math.max(0, Math.min(100, body.score ?? 0));
        const recipientName = (body.recipient_name ?? "").toString().slice(0, 100);
        if (score < 70) return json({ error: "Score must be >= 70 to receive a certificate" }, 400);
        const { data, error } = await admin
          .from("education_certificates")
          .insert({
            user_id: user.id,
            course_id: body.course_id ?? null,
            course_title: courseTitle,
            score,
            recipient_name: recipientName,
          })
          .select()
          .single();
        if (error) throw error;
        return json({ certificate: data });
      }

      case "math.solve": {
        const problem = (body.problem_text ?? "").toString();
        const imageUrl = body.image_url as string | undefined;
        if (!problem && !imageUrl) return json({ error: "problem_text or image_url required" }, 400);

        // Charge 3 homework credits
        const { data: hc } = await admin
          .from("homework_credits")
          .select("credits_remaining")
          .eq("user_id", user.id)
          .maybeSingle();
        if (!hc || hc.credits_remaining < 3) return json({ error: "insufficient_credits" }, 402);
        await admin
          .from("homework_credits")
          .update({ credits_remaining: hc.credits_remaining - 3 })
          .eq("user_id", user.id);

        const sys = "You are a step-by-step math tutor. Return JSON: {\"steps\":[{\"title\":\"...\",\"explanation\":\"...\",\"latex\":\"...\"}], \"answer\":\"...\"}. Be concise and pedagogical.";
        const userMsg: any[] = [{ type: "text", text: problem || "Solve the problem in the image." }];
        if (imageUrl) userMsg.push({ type: "image_url", image_url: { url: imageUrl } });

        const raw = await callAI(
          [
            { role: "system", content: sys },
            { role: "user", content: userMsg },
          ],
          { json: true }
        );
        let parsed: any = { steps: [{ title: "Solution", explanation: raw }], answer: "" };
        try { parsed = JSON.parse(raw); } catch {}

        await admin.from("education_math_solves").insert({
          user_id: user.id,
          image_url: imageUrl ?? null,
          problem_text: problem || null,
          solution_steps: parsed.steps ?? [],
          credits_used: 3,
        });
        return json({ solution: parsed });
      }

      case "tutor.chat": {
        const message = (body.message ?? "").toString().slice(0, 4000);
        const context = (body.context ?? "").toString().slice(0, 8000);
        if (!message) return json({ error: "message required" }, 400);

        const { data: hc } = await admin
          .from("homework_credits")
          .select("credits_remaining")
          .eq("user_id", user.id)
          .maybeSingle();
        if (!hc || hc.credits_remaining < 3) return json({ error: "insufficient_credits" }, 402);
        await admin
          .from("homework_credits")
          .update({ credits_remaining: hc.credits_remaining - 3 })
          .eq("user_id", user.id);

        const reply = await callAI([
          { role: "system", content: `You are a patient, encouraging AI tutor. Context:\n${context}` },
          { role: "user", content: message },
        ]);
        return json({ reply });
      }

      case "notes.generate": {
        const topic = (body.topic ?? "").toString().slice(0, 500);
        if (!topic) return json({ error: "topic required" }, 400);
        const reply = await callAI([
          { role: "system", content: "Generate concise study notes in markdown. Use headings, bullets, and bold for key terms." },
          { role: "user", content: `Topic: ${topic}` },
        ]);
        return json({ markdown: reply });
      }

      case "deck.ai_generate": {
        const topic = (body.topic ?? "").toString().slice(0, 300);
        const count = Math.min(Math.max(body.count ?? 10, 3), 20);
        if (!topic) return json({ error: "topic required" }, 400);

        const raw = await callAI(
          [
            { role: "system", content: `Generate ${count} flashcards as JSON: {"cards":[{"front":"...","back":"...","hint":"..."}]}. Front = question/term, back = answer/definition.` },
            { role: "user", content: `Topic: ${topic}` },
          ],
          { json: true }
        );
        let cards: any[] = [];
        try { cards = JSON.parse(raw).cards ?? []; } catch {}
        return json({ cards });
      }

      // ============================================================
      // Module courses: curriculum + exam + certificate + workbook + progress
      // ============================================================
      case "course.curriculum":
      case "course.exam":
      case "course.submit":
      case "course.videos":
      case "course.workbook":
      case "course.progress_get":
      case "course.progress_set":
      case "course.feedback": {
        const meta = body.meta as any;
        if (!meta || !meta.module_key || !meta.course_slug || !meta.course_title) {
          return json({ error: "meta.module_key / course_slug / course_title required" }, 400);
        }
        const course_key = `${meta.module_key}:${meta.course_slug}`;
        const sub = action.slice("course.".length);
        return await handleCourse(sub, meta, course_key, body, user, admin, req);
      }

      default:
        return json({ error: `unknown action: ${action}` }, 400);
    }
  } catch (e: any) {
    console.error("education-router error", e);
    return json({ error: e?.message ?? "internal_error" }, 500);
  }
});

// ============================================================
// Course helpers (curriculum, exam, cert, workbook, progress, feedback)
// ============================================================

async function generateCurriculum(meta: any) {
  const sys =
    "You are a senior curriculum designer. Return STRICT JSON with schema: " +
    '{"overview":"string (2-3 rich paragraphs)","learning_outcomes":["..."],"modules":[{"title":"Module title","summary":"1 paragraph","lessons":[{"title":"Lesson title","content":"3-5 detailed paragraphs, concrete examples, numbers, tools, exercises","key_points":["...","..."],"exercise":"a practical exercise for the learner"}]}],"final_project":"detailed final capstone project brief","resources":[{"label":"...","hint":"..."}]}. ' +
    "Write 6 modules with 3 lessons each (18 lessons total). Content must be rich, practical, worth the course price, in English.";
  const usr =
    `Course: ${meta.course_title}\nDescription: ${meta.description}\n` +
    `Level: ${meta.level}\nDuration: ${meta.duration}\nSkills: ${(meta.skills || []).join(", ")}\nPrice paid: €${meta.price}\n\n` +
    "Design an in-depth curriculum that fully justifies the price paid.";
  return await aiJsonLovable(sys, usr);
}

async function generateQuizPool(meta: any, curriculum: any) {
  const sys =
    "You are an assessment designer. Return STRICT JSON: " +
    '{"questions":[{"q":"question text","options":["A","B","C","D"],"answer_index":0,"explanation":"brief"}]}. ' +
    "Produce EXACTLY 20 rigorous multiple-choice questions covering the full curriculum. " +
    "Each question has 4 options and exactly one correct answer. Vary difficulty. No trick questions. Use English.";
  const usr = `Course: ${meta.course_title}\nCurriculum:\n` +
    (curriculum?.modules || []).map((m: any, i: number) =>
      `Module ${i + 1}: ${m.title}\n` +
      (m.lessons || []).map((l: any) => ` - ${l.title}: ${(l.key_points || []).slice(0, 3).join("; ")}`).join("\n")
    ).join("\n");
  const out = await aiJsonLovable(sys, usr);
  const arr = Array.isArray(out?.questions) ? out.questions : [];
  return arr.filter((q: any) => q && typeof q.q === "string" && Array.isArray(q.options) && q.options.length === 4 && Number.isInteger(q.answer_index));
}

async function loadOrCreateCache(admin: any, meta: any) {
  const course_key = `${meta.module_key}:${meta.course_slug}`;
  const { data: cached } = await admin.from("module_course_content_cache").select("*").eq("course_key", course_key).maybeSingle();
  if (cached && cached.content && Array.isArray(cached.quiz_pool) && cached.quiz_pool.length >= 10) return cached;
  const content = cached?.content ?? await generateCurriculum(meta);
  const quiz_pool = (cached?.quiz_pool && Array.isArray(cached.quiz_pool) && cached.quiz_pool.length >= 10)
    ? cached.quiz_pool : await generateQuizPool(meta, content);
  const row = { course_key, module_key: meta.module_key, course_slug: meta.course_slug, course_title: meta.course_title, content, quiz_pool, updated_at: new Date().toISOString() };
  await admin.from("module_course_content_cache").upsert(row);
  return row;
}

function pickExamQuestions(pool: any[]) { return [...pool].sort(() => Math.random() - 0.5).slice(0, 10); }
function makeCertNumber() {
  const rand = crypto.getRandomValues(new Uint8Array(4));
  const hex = Array.from(rand).map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  return `UNIQ-${new Date().getFullYear()}-${hex}`;
}
function pickAnswerKey(pool: any[], picked: any[]): number[] {
  return picked.map((q: any) => { const f = pool.find((p: any) => p.q === q.q); return f ? Number(f.answer_index) : 0; });
}
const SIGNING_SECRET = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "unique-fallback-secret";
async function signKey(key: number[]) {
  const payload = JSON.stringify({ k: key, t: Date.now() });
  const enc = new TextEncoder();
  const ck = await crypto.subtle.importKey("raw", enc.encode(SIGNING_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", ck, enc.encode(payload));
  return btoa(payload) + "." + btoa(String.fromCharCode(...new Uint8Array(sig)));
}
async function verifyKey(token: string): Promise<number[] | null> {
  try {
    const [p, s] = token.split("."); if (!p || !s) return null;
    const payload = atob(p); const enc = new TextEncoder();
    const ck = await crypto.subtle.importKey("raw", enc.encode(SIGNING_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const sig = Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
    if (!(await crypto.subtle.verify("HMAC", ck, sig, enc.encode(payload)))) return null;
    const parsed = JSON.parse(payload);
    if (!Array.isArray(parsed.k)) return null;
    if (typeof parsed.t === "number" && Date.now() - parsed.t > 2 * 60 * 60 * 1000) return null;
    return parsed.k.map((n: any) => Number(n));
  } catch { return null; }
}

async function generateCertPdf(opts: { recipient: string; course: string; module: string; score: number; certNumber: string; verifyUrl: string }) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontLight = await pdf.embedFont(StandardFonts.Helvetica);
  const fontItalic = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const purple = rgb(0.396, 0.169, 0.827); const pink = rgb(1, 0.078, 0.576);
  const dark = rgb(0.09, 0.09, 0.15); const grey = rgb(0.42, 0.42, 0.46);
  const M = 24;
  page.drawRectangle({ x: M, y: M, width: 842 - 2 * M, height: 595 - 2 * M, borderColor: purple, borderWidth: 2 });
  page.drawRectangle({ x: M + 8, y: M + 8, width: 842 - 2 * (M + 8), height: 595 - 2 * (M + 8), borderColor: pink, borderWidth: 1 });
  page.drawRectangle({ x: M + 16, y: 595 - M - 60, width: 842 - 2 * (M + 16), height: 46, color: purple });
  page.drawText("UNIQUE", { x: M + 32, y: 595 - M - 46, size: 22, font, color: rgb(1, 1, 1) });
  page.drawText("CERTIFICATE OF COMPLETION", { x: M + 130, y: 595 - M - 42, size: 14, font: fontLight, color: rgb(1, 1, 1) });
  page.drawText("uniqueapp.fun", { x: 842 - M - 120, y: 595 - M - 42, size: 11, font: fontLight, color: rgb(1, 1, 1) });
  page.drawText("This is to certify that", { x: 421 - 90, y: 420, size: 14, font: fontItalic, color: grey });
  const nameW = font.widthOfTextAtSize(opts.recipient, 34);
  page.drawText(opts.recipient, { x: 421 - nameW / 2, y: 370, size: 34, font, color: dark });
  page.drawLine({ start: { x: 421 - nameW / 2 - 20, y: 362 }, end: { x: 421 + nameW / 2 + 20, y: 362 }, thickness: 1.5, color: purple });
  page.drawText("has successfully completed the course", { x: 421 - 130, y: 330, size: 13, font: fontLight, color: grey });
  const cW = font.widthOfTextAtSize(opts.course, 22);
  page.drawText(opts.course, { x: 421 - cW / 2, y: 290, size: 22, font, color: purple });
  const modText = `in the ${opts.module} track`;
  const mW = fontItalic.widthOfTextAtSize(modText, 12);
  page.drawText(modText, { x: 421 - mW / 2, y: 268, size: 12, font: fontItalic, color: grey });
  page.drawCircle({ x: 421, y: 200, size: 38, color: pink });
  const sT = `${Math.round(opts.score)}%`; const sW = font.widthOfTextAtSize(sT, 22);
  page.drawText(sT, { x: 421 - sW / 2, y: 192, size: 22, font, color: rgb(1, 1, 1) });
  page.drawText("Final Exam Score", { x: 421 - 45, y: 155, size: 10, font: fontLight, color: grey });
  try {
    const qr = await QRCode.toDataURL(opts.verifyUrl, { errorCorrectionLevel: "M", margin: 0, width: 220, color: { dark: "#1a1a26", light: "#ffffff" } });
    const bin = Uint8Array.from(atob(qr.split(",")[1]), (c) => c.charCodeAt(0));
    const img = await pdf.embedPng(bin);
    page.drawImage(img, { x: 842 - M - 40 - 90, y: 130, width: 90, height: 90 });
    page.drawText("Scan to verify", { x: 842 - M - 40 - 90 + 8, y: 118, size: 9, font: fontLight, color: grey });
  } catch {}
  const dateStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  page.drawText(`Issued: ${dateStr}`, { x: M + 40, y: 90, size: 11, font: fontLight, color: dark });
  page.drawText(`Certificate No: ${opts.certNumber}`, { x: M + 40, y: 72, size: 11, font, color: dark });
  page.drawText(`Verify: ${opts.verifyUrl}`, { x: M + 40, y: 54, size: 10, font: fontLight, color: purple });
  page.drawText("Unique Learning", { x: M + 300, y: 90, size: 12, font, color: dark });
  page.drawText("Authorised Signatory", { x: M + 300, y: 76, size: 9, font: fontLight, color: grey });
  page.drawLine({ start: { x: M + 300, y: 100 }, end: { x: M + 440, y: 100 }, thickness: 0.8, color: dark });
  return await pdf.save();
}

async function generateWorkbookPdf(meta: any, curriculum: any): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const purple = rgb(0.396, 0.169, 0.827); const dark = rgb(0.09, 0.09, 0.15); const grey = rgb(0.42, 0.42, 0.46);
  const PW = 595, PH = 842, M = 48;
  const wrap = (t: string, f: any, s: number, w: number): string[] => {
    const words = String(t || "").split(/\s+/); const lines: string[] = []; let cur = "";
    for (const wd of words) { const tt = cur ? `${cur} ${wd}` : wd; if (f.widthOfTextAtSize(tt, s) > w) { if (cur) lines.push(cur); cur = wd; } else cur = tt; }
    if (cur) lines.push(cur); return lines;
  };
  let page = pdf.addPage([PW, PH]); let y = PH - M;
  const newPage = () => { page = pdf.addPage([PW, PH]); y = PH - M; };
  const ensure = (h: number) => { if (y - h < M) newPage(); };
  const drawH = (t: string, size: number, color = dark, f = bold) => {
    for (const ln of wrap(t, f, size, PW - 2 * M)) { ensure(size + 6); page.drawText(ln, { x: M, y: y - size, size, font: f, color }); y -= size + 6; }
  };
  const drawP = (t: string, size = 10, color = dark, f = font) => {
    for (const p of String(t || "").split(/\n+/)) {
      for (const ln of wrap(p, f, size, PW - 2 * M)) { ensure(size + 4); page.drawText(ln, { x: M, y: y - size, size, font: f, color }); y -= size + 3; }
      y -= 4;
    }
  };
  page.drawRectangle({ x: 0, y: PH - 120, width: PW, height: 120, color: purple });
  page.drawText("UNIQUE LEARNING", { x: M, y: PH - 60, size: 14, font: bold, color: rgb(1, 1, 1) });
  page.drawText("Course Workbook", { x: M, y: PH - 90, size: 22, font: bold, color: rgb(1, 1, 1) });
  y = PH - 170;
  drawH(meta.course_title, 22, purple);
  drawP(meta.module_label || meta.module_key, 12, grey, italic);
  drawP(meta.description || "", 11);
  drawP(`Level: ${meta.level || "All levels"}   |   Duration: ${meta.duration || "—"}`, 10, grey, italic); y -= 10;
  if (curriculum?.overview) { drawH("Course Overview", 14, purple); drawP(curriculum.overview); }
  if (Array.isArray(curriculum?.learning_outcomes) && curriculum.learning_outcomes.length) {
    drawH("What you will learn", 14, purple);
    for (const o of curriculum.learning_outcomes) drawP(`• ${o}`, 10);
  }
  (curriculum?.modules || []).forEach((m: any, mi: number) => {
    newPage(); drawH(`Module ${mi + 1}: ${m.title}`, 16, purple);
    if (m.summary) drawP(m.summary, 10, grey, italic);
    (m.lessons || []).forEach((l: any, li: number) => {
      ensure(60);
      drawH(`Lesson ${mi + 1}.${li + 1}: ${l.title}`, 12, dark);
      if (l.content) drawP(l.content, 10);
      if (Array.isArray(l.key_points) && l.key_points.length) {
        drawP("Key points:", 10, purple, bold);
        for (const k of l.key_points) drawP(`  • ${k}`, 10);
      }
      if (l.exercise) { drawP("Exercise:", 10, purple, bold); drawP(l.exercise, 10); }
      y -= 6;
    });
  });
  if (curriculum?.final_project) { newPage(); drawH("Final Capstone Project", 18, purple); drawP(curriculum.final_project); }
  if (Array.isArray(curriculum?.resources) && curriculum.resources.length) {
    ensure(60); drawH("Resources", 14, purple);
    for (const r of curriculum.resources) drawP(`• ${r.label}${r.hint ? " — " + r.hint : ""}`, 10);
  }
  return await pdf.save();
}

async function handleCourse(sub: string, meta: any, course_key: string, body: any, user: any, admin: any, req: Request) {
  if (sub === "curriculum") {
    const cached = await loadOrCreateCache(admin, meta);
    return json({ content: cached.content });
  }
  if (sub === "videos") {
    const lk = String(body.lesson_key || "").trim();
    const lt = String(body.lesson_title || "").trim();
    if (!lk || !lt) return json({ error: "lesson_key & lesson_title required" }, 400);
    const q1 = encodeURIComponent(`${lt} ${meta.course_title} tutorial`);
    const q2 = encodeURIComponent(`${lt} explained masterclass`);
    return json({
      videos: [
        { title: `Tutorial: ${lt}`, embed_url: `https://www.youtube.com/embed?listType=search&list=${q1}` },
        { title: `Masterclass: ${lt}`, embed_url: `https://www.youtube.com/embed?listType=search&list=${q2}` },
      ],
    });
  }
  if (sub === "progress_get") {
    const { data } = await admin.from("education_lesson_progress").select("lesson_key").eq("user_id", user.id).eq("course_key", course_key);
    return json({ completed: (data || []).map((r: any) => r.lesson_key) });
  }
  if (sub === "progress_set") {
    const lk = String(body.lesson_key || "").trim(); const done = body.completed !== false;
    if (!lk) return json({ error: "lesson_key required" }, 400);
    if (done) await admin.from("education_lesson_progress").upsert({ user_id: user.id, course_key, lesson_key: lk }, { onConflict: "user_id,course_key,lesson_key" });
    else await admin.from("education_lesson_progress").delete().eq("user_id", user.id).eq("course_key", course_key).eq("lesson_key", lk);
    return json({ ok: true });
  }
  if (sub === "workbook") {
    const rl = rateLimit(`wb:${user.id}`, 5, 3600000); if (!rl.ok) return json({ error: "rate_limited", retry_in_ms: rl.resetIn }, 429);
    const cached = await loadOrCreateCache(admin, meta);
    const bytes = await generateWorkbookPdf(meta, cached.content);
    const path = `${user.id}/workbook-${meta.module_key}-${meta.course_slug}.pdf`;
    const { error } = await admin.storage.from("certificates").upload(path, bytes, { contentType: "application/pdf", upsert: true });
    if (error) throw error;
    const { data } = admin.storage.from("certificates").getPublicUrl(path);
    return json({ pdf_url: data.publicUrl });
  }
  if (sub === "feedback") {
    const rl = rateLimit(`fb:${user.id}`, 30, 3600000); if (!rl.ok) return json({ error: "rate_limited", retry_in_ms: rl.resetIn }, 429);
    const lk = String(body.lesson_key || "").trim();
    const lt = String(body.lesson_title || "").trim();
    const ex = String(body.exercise || "").trim();
    const sm = String(body.submission || "").trim().slice(0, 8000);
    if (!lk || !sm) return json({ error: "lesson_key & submission required" }, 400);
    const sys = 'You are an expert tutor. Return STRICT JSON: {"score":0-100,"strengths":["..."],"improvements":["..."],"next_step":"one concrete action","summary":"2-3 sentences"}. Be encouraging, specific.';
    const usr = `Course: ${meta.course_title}\nLesson: ${lt}\nExercise: ${ex}\n\nSubmission:\n${sm}`;
    const fb = await aiJsonLovable(sys, usr);
    const score = Math.max(0, Math.min(100, Number(fb?.score ?? 0)));
    await admin.from("education_exercise_submissions").upsert({ user_id: user.id, course_key, lesson_key: lk, submission_text: sm, ai_feedback: fb, score }, { onConflict: "user_id,course_key,lesson_key" });
    return json({ feedback: fb, score });
  }
  if (sub === "exam") {
    const rl = rateLimit(`ex:${user.id}`, 10, 3600000); if (!rl.ok) return json({ error: "rate_limited", retry_in_ms: rl.resetIn }, 429);
    const cached = await loadOrCreateCache(admin, meta);
    const picked = pickExamQuestions(cached.quiz_pool as any[]).map((q: any, i: number) => ({ id: i, q: q.q, options: q.options }));
    const answerKey = pickAnswerKey(cached.quiz_pool, picked);
    const sig = await signKey(answerKey);
    return json({ questions: picked, exam_token: sig });
  }
  if (sub === "submit") {
    const rl = rateLimit(`sb:${user.id}`, 20, 3600000); if (!rl.ok) return json({ error: "rate_limited", retry_in_ms: rl.resetIn }, 429);
    const answers = body.answers as number[];
    const token = body.exam_token as string;
    const recipient = String(body.recipient_name ?? "").trim().slice(0, 80) || "Learner";
    if (!Array.isArray(answers) || !token) return json({ error: "answers & exam_token required" }, 400);
    const key = await verifyKey(token);
    if (!key) return json({ error: "invalid exam_token" }, 400);
    if (answers.length !== key.length) return json({ error: "answer count mismatch" }, 400);
    let correct = 0;
    for (let i = 0; i < key.length; i++) if (Number(answers[i]) === Number(key[i])) correct++;
    const score = Math.round((correct / key.length) * 100);
    const passed = score >= 70;
    if (!passed) return json({ passed: false, score, correct, total: key.length });
    const certNumber = makeCertNumber();
    const originHdr = req.headers.get("origin") || "https://uniqueapp.fun";
    const verifyUrl = `${originHdr.replace(/\/$/, "")}/cert/${certNumber}`;
    const bytes = await generateCertPdf({ recipient, course: meta.course_title, module: meta.module_label ?? meta.module_key, score, certNumber, verifyUrl });
    const path = `${user.id}/${certNumber}.pdf`;
    const { error: upErr } = await admin.storage.from("certificates").upload(path, bytes, { contentType: "application/pdf", upsert: true });
    if (upErr) throw upErr;
    const { data: pub } = admin.storage.from("certificates").getPublicUrl(path);
    const { data: certRow, error: insErr } = await admin.from("education_certificates").insert({
      user_id: user.id,
      course_title: `${meta.module_label ?? meta.module_key} · ${meta.course_title}`,
      score, recipient_name: recipient, certificate_code: certNumber, pdf_url: pub.publicUrl,
    }).select().single();
    if (insErr) throw insErr;
    return json({ passed: true, score, correct, total: key.length, certificate: certRow, verify_url: verifyUrl });
  }
  return json({ error: `unknown course sub-action: ${sub}` }, 400);
}

