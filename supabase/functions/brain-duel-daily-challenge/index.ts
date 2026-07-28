import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

const FALLBACK_QUESTIONS = (category: string) => ([
  { question: `Which of these is most closely related to ${category}?`, options: ["A relevant concept", "A random object", "An unrelated term", "None of these"], correct: 0 },
]);

async function generateQuestions(category: string, count: number) {
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  if (!OPENAI_API_KEY) return null;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You generate factual multiple-choice trivia questions. Return ONLY valid JSON." },
        { role: "user", content: `Generate ${count} unique trivia questions about "${category}". Each has exactly 4 options and one correct index (0-3).` },
      ],
      tools: [{
        type: "function",
        function: {
          name: "generate_questions",
          parameters: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    options: { type: "array", items: { type: "string" } },
                    correct: { type: "number", description: "index 0-3 of the correct option" },
                  },
                  required: ["question", "options", "correct"],
                },
              },
            },
            required: ["questions"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "generate_questions" } },
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) return null;
  try {
    const parsed = JSON.parse(toolCall.function.arguments);
    const qs = (parsed.questions || []).filter((q: any) =>
      q?.question && Array.isArray(q.options) && q.options.length === 4 && typeof q.correct === "number" && q.correct >= 0 && q.correct <= 3);
    return qs.length ? qs.slice(0, count) : null;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authErr || !user) throw new Error("Unauthorized");

    const { action, challengeId, answers, timeTaken } = await req.json();
    const today = new Date().toISOString().split("T")[0];

    const getTodayChallenge = async () => {
      const { data: existing } = await supabase
        .from("brain_duel_daily_challenges")
        .select("*")
        .eq("challenge_date", today)
        .maybeSingle();
      if (existing) return existing;

      const categories = ["science", "history", "geography", "film", "music", "sports", "art", "food", "business", "gaming"];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const title = `Daily ${category.charAt(0).toUpperCase() + category.slice(1)} Challenge`;
      const description = `Test your ${category} knowledge in today's speed challenge!`;

      const { data: newChallenge } = await supabase
        .from("brain_duel_daily_challenges")
        .insert({ challenge_date: today, category, title, description, question_count: 5, time_limit: 60, reward_credits: 15 })
        .select()
        .single();
      return newChallenge;
    };

    if (action === "get-today") {
      const challenge = await getTodayChallenge();

      const { data: entries } = await supabase
        .from("brain_duel_daily_challenge_entries")
        .select("*")
        .eq("challenge_id", challenge?.id)
        .order("score", { ascending: false })
        .order("time_taken", { ascending: true })
        .limit(50);

      const userIds = entries?.map((e: any) => e.user_id) || [];
      const { data: profiles } = userIds.length > 0
        ? await supabase.from("profiles").select("id, full_name, avatar_url").in("id", userIds)
        : { data: [] };

      const leaderboard = entries?.map((e: any) => ({ ...e, profile: profiles?.find((p: any) => p.id === e.user_id) })) || [];
      const userEntry = entries?.find((e: any) => e.user_id === user.id);

      const { questions: _hidden, ...safeChallenge } = (challenge as any) || {};

      return new Response(JSON.stringify({ challenge: safeChallenge, leaderboard, userEntry }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Returns the real quiz questions (without the correct answers)
    if (action === "get-questions") {
      const challenge: any = await getTodayChallenge();
      if (!challenge) throw new Error("No challenge available");

      const { data: existingEntry } = await supabase
        .from("brain_duel_daily_challenge_entries")
        .select("id")
        .eq("challenge_id", challenge.id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (existingEntry) {
        return new Response(JSON.stringify({ error: "Already completed today's challenge" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      let questions = challenge.questions;
      if (!Array.isArray(questions) || questions.length === 0) {
        questions = await generateQuestions(challenge.category, challenge.question_count || 5)
          || FALLBACK_QUESTIONS(challenge.category);
        await supabase
          .from("brain_duel_daily_challenges")
          .update({ questions, question_count: questions.length })
          .eq("id", challenge.id);
      }

      const publicQuestions = questions.map((q: any, i: number) => ({ index: i, question: q.question, options: q.options }));

      return new Response(JSON.stringify({ challengeId: challenge.id, timeLimit: challenge.time_limit, questions: publicQuestions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "submit") {
      if (!challengeId || !Array.isArray(answers)) throw new Error("Missing required fields");

      const { data: existing } = await supabase
        .from("brain_duel_daily_challenge_entries")
        .select("id")
        .eq("challenge_id", challengeId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        return new Response(JSON.stringify({ error: "Already submitted today's challenge" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const { data: challenge } = await supabase
        .from("brain_duel_daily_challenges")
        .select("*")
        .eq("id", challengeId)
        .single();
      if (!challenge) throw new Error("Challenge not found");

      const questions: any[] = Array.isArray((challenge as any).questions) ? (challenge as any).questions : [];
      // Server-side grading — the client never sees the correct answers.
      let score = 0;
      questions.forEach((q, i) => { if (answers[i] === q.correct) score++; });

      const safeTime = Math.max(0, Math.min(Number(timeTaken) || 0, challenge.time_limit || 60));

      const { data: entry } = await supabase
        .from("brain_duel_daily_challenge_entries")
        .insert({ challenge_id: challengeId, user_id: user.id, score, time_taken: safeTime })
        .select()
        .single();

      let reward = 0;
      if (score >= Math.ceil((questions.length || 5) * 0.6)) {
        reward = challenge.reward_credits || 10;
        const { data: credits } = await supabase
          .from("brain_duel_credits")
          .select("credits")
          .eq("user_id", user.id)
          .maybeSingle();

        if (credits) {
          await supabase.from("brain_duel_credits").update({ credits: credits.credits + reward }).eq("user_id", user.id);
        } else {
          await supabase.from("brain_duel_credits").insert({ user_id: user.id, credits: 100 + reward });
        }
      }

      return new Response(JSON.stringify({ entry, score, total: questions.length, reward }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    throw new Error("Invalid action");
  } catch (e: any) {
    console.error("brain-duel-daily-challenge error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
