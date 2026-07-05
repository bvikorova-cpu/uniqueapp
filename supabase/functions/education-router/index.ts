// Universal Education edge function - one slot handles all education actions
// Actions: srs.review, srs.due, daily.today, daily.submit, achievement.check,
//          league.update, league.top, cert.issue, math.solve, notes.generate,
//          tutor.chat, deck.ai_generate
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
        const xpAdd = Math.round((score / 100) * 50);

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

      default:
        return json({ error: `unknown action: ${action}` }, 400);
    }
  } catch (e: any) {
    console.error("education-router error", e);
    return json({ error: e?.message ?? "internal_error" }, 500);
  }
});
