import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { callOpenAIRaw } from "../_shared/openai.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const COSTS: Record<string, number> = { photo_math: 3, pdf_to_quiz: 3, generate_quiz: 5 };

const jsonRes = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!SERVICE_KEY) return jsonRes({ error: "SUPABASE_SERVICE_ROLE_KEY not configured" }, 500);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonRes({ error: "Missing Authorization" }, 401);
    const supa = createClient(SUPABASE_URL, ANON_KEY);
    const { data: userData } = await supa.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!userData.user) return jsonRes({ error: "Not authenticated" }, 401);
    const userId = userData.user.id;

    const body = await req.json();
    const action = body?.action as string;
    const cost = COSTS[action];
    if (!cost) return jsonRes({ error: "Unknown action" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Unified balance = free tier + paid ai_credits
    const [{ data: paidRow }, { data: freeRow }] = await Promise.all([
      admin.from("ai_credits").select("credits_remaining").eq("user_id", userId).maybeSingle(),
      admin.from("free_tier_credits").select("balance").eq("user_id", userId).maybeSingle(),
    ]);
    const paidBalance = paidRow?.credits_remaining ?? 0;
    const freeBalance = (freeRow as any)?.balance ?? 0;
    const totalBalance = paidBalance + freeBalance;
    if (totalBalance < cost) {
      return jsonRes({ error: "Insufficient credits", credits_remaining: totalBalance, cost }, 402);
    }

    const deductUnified = async () => {
      // Spend from free first, remainder from paid
      const [{ data: currentPaidRow }, { data: currentFreeRow }] = await Promise.all([
        admin.from("ai_credits").select("credits_remaining").eq("user_id", userId).maybeSingle(),
        admin.from("free_tier_credits").select("balance").eq("user_id", userId).maybeSingle(),
      ]);
      const currentPaidBalance = currentPaidRow?.credits_remaining ?? 0;
      const currentFreeBalance = (currentFreeRow as any)?.balance ?? 0;
      const currentTotalBalance = currentPaidBalance + currentFreeBalance;
      if (currentTotalBalance < cost) throw new Error("Insufficient credits");

      let remaining = cost;
      const fromFree = Math.min(currentFreeBalance, remaining);
      remaining -= fromFree;
      if (fromFree > 0) {
        const { error: freeDeductError } = await admin.rpc("consume_free_tier_credits_for_user", {
          p_user_id: userId,
          p_amount: fromFree,
          p_reason: `education_${action}`,
        });
        if (freeDeductError) throw freeDeductError;
      }
      if (remaining > 0) {
        const { error: paidDeductError } = await admin.rpc("deduct_ai_credits", {
          p_user_id: userId, p_amount: remaining, p_reason: `education_${action}`, p_source: "education-ai",
        });
        if (paidDeductError) throw paidDeductError;
      }
      const { error: historyError } = await admin.from("ai_usage_history").insert({
        user_id: userId, usage_type: action, credits_used: cost, description: `education-ai:${action}`,
      });
      if (historyError) console.error("[education-ai] usage history error", historyError.message);
      return currentTotalBalance - cost;
    };

    const parseToolQuiz = (data: any) => {
      const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      if (!args) throw new Error("AI did not return quiz");
      const parsed = JSON.parse(args);
      const questions = Array.isArray(parsed?.questions) ? parsed.questions : [];
      const safeQuestions = questions
        .map((q: any) => {
          const options = Array.isArray(q?.options)
            ? q.options.map((o: unknown) => String(o ?? "").trim()).filter(Boolean).slice(0, 4)
            : [];
          if (!String(q?.question ?? "").trim() || options.length < 2) return null;
          const correctIndex = Math.max(0, Math.min(options.length - 1, Number(q?.correct_index) || 0));
          return {
            question: String(q.question).trim(),
            options,
            correct_index: correctIndex,
            explanation: String(q?.explanation ?? "").trim() || "Review the correct option and compare it with the alternatives.",
          };
        })
        .filter(Boolean);
      if (safeQuestions.length < 3) throw new Error("AI returned too few questions");
      return {
        title: String(parsed?.title ?? "AI Generated Quiz").trim().slice(0, 120) || "AI Generated Quiz",
        questions: safeQuestions,
      };
    };

    const ensureGeneratedQuizLesson = async () => {
      const courseTitle = "My AI Generated Quizzes";
      const { data: existingCourse, error: courseLookupError } = await admin
        .from("courses")
        .select("id")
        .eq("creator_id", userId)
        .eq("title", courseTitle)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (courseLookupError) throw courseLookupError;

      let courseId = existingCourse?.id;
      if (!courseId) {
        const { data: newCourse, error: courseCreateError } = await admin
          .from("courses")
          .insert({
            creator_id: userId,
            title: courseTitle,
            description: "Private workspace for quizzes generated in Education.",
            category: "education",
            difficulty_level: "beginner",
            price: 0,
            is_published: false,
          })
          .select("id")
          .single();
        if (courseCreateError) throw courseCreateError;
        courseId = newCourse.id;
      }

      const { data: existingLesson, error: lessonLookupError } = await admin
        .from("course_lessons")
        .select("id")
        .eq("course_id", courseId)
        .eq("title", "Generated Quiz Bank")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (lessonLookupError) throw lessonLookupError;
      if (existingLesson?.id) return existingLesson.id;

      const { data: newLesson, error: lessonCreateError } = await admin
        .from("course_lessons")
        .insert({
          course_id: courseId,
          title: "Generated Quiz Bank",
          description: "Private generated quiz storage.",
          duration_minutes: 0,
          order_index: 0,
          is_preview: false,
        })
        .select("id")
        .single();
      if (lessonCreateError) throw lessonCreateError;
      return newLesson.id;
    };

    const quizToolDefinition = {
      type: "function" as const,
      function: {
        name: "create_quiz", description: "Return the generated quiz",
        parameters: { type: "object", properties: {
          title: { type: "string" },
          questions: { type: "array", items: { type: "object", properties: {
            question: { type: "string" },
            options: { type: "array", items: { type: "string" } },
            correct_index: { type: "integer" },
            explanation: { type: "string" } },
            required: ["question", "options", "correct_index", "explanation"] } } },
          required: ["title", "questions"] } }
    };

    // ─── PHOTO MATH ───
    if (action === "photo_math") {
      const { imageDataUrl, question } = body;
      if (!imageDataUrl || !String(imageDataUrl).startsWith("data:image/")) {
        return jsonRes({ error: "imageDataUrl required" }, 400);
      }
      const data = await callOpenAIRaw({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a brilliant math tutor. Look at the photo of the math problem and explain the solution step by step. Use LaTeX ($...$ inline, $$...$$ block). Always answer in English. If not a math problem, say so politely." },
          { role: "user", content: [
              { type: "text", text: question || "Solve this problem step by step." },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ] as any },
        ],
      });

      const solution = data?.choices?.[0]?.message?.content ?? "";

      const creditsRemaining = await deductUnified();
      return jsonRes({ solution, credits_remaining: creditsRemaining, cost });
    }

    // ─── PDF → QUIZ ───
    if (action === "pdf_to_quiz") {
      const { text, numQuestions = 8, difficulty = "medium" } = body;
      const safeText = typeof text === "string" ? text.slice(0, 20000) : "";
      if (safeText.trim().length < 50) return jsonRes({ error: "Text too short" }, 400);
      const safeN = Math.max(3, Math.min(20, Number(numQuestions) || 8));
      const data = await callOpenAIRaw({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a quiz designer. From the study text, generate a multiple-choice quiz. Always English. Each question has 4 options and one correct index (0-3). Respond ONLY by calling the create_quiz tool." },
          { role: "user", content: `Difficulty: ${difficulty}. Create ${safeN} questions from:\n\n${safeText}` },
        ],
        tools: [quizToolDefinition],
        tool_choice: { type: "function", function: { name: "create_quiz" } },
      });

      const quiz = parseToolQuiz(data);

      const creditsRemaining = await deductUnified();
      return jsonRes({ quiz, credits_remaining: creditsRemaining, cost });
    }

    // ─── TOPIC → SAVED QUIZ ───
    if (action === "generate_quiz") {
      const topic = typeof body?.topic === "string" ? body.topic.trim().slice(0, 200) : "";
      if (topic.length < 2) return jsonRes({ error: "Topic required" }, 400);
      const safeN = Math.max(3, Math.min(20, Number(body?.numQuestions) || 10));
      const difficulty = ["easy", "medium", "hard", "expert"].includes(String(body?.difficulty))
        ? String(body.difficulty)
        : "medium";

      const data = await callOpenAIRaw({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert education quiz designer. Generate high-quality multiple-choice questions in English. Each question has 4 concise options and one correct index (0-3). Respond ONLY by calling the create_quiz tool." },
          { role: "user", content: `Topic: ${topic}\nDifficulty: ${difficulty}\nCreate ${safeN} questions suitable for a learner to practice.` },
        ],
        tools: [quizToolDefinition],
        tool_choice: { type: "function", function: { name: "create_quiz" } },
      });

      const quiz = parseToolQuiz(data);
      const lessonId = await ensureGeneratedQuizLesson();
      const { data: quizRow, error: quizInsertError } = await admin
        .from("course_quizzes")
        .insert({ lesson_id: lessonId, title: quiz.title, passing_score: 70, difficulty })
        .select("id, title, passing_score, created_at, difficulty")
        .single();
      if (quizInsertError) throw quizInsertError;

      const questionRows = quiz.questions.map((q: any, index: number) => ({
        quiz_id: quizRow.id,
        question: q.question,
        options: q.options,
        correct_answer: q.options[q.correct_index],
        explanation: q.explanation,
        order_index: index,
      }));
      const { error: questionsInsertError } = await admin.from("quiz_questions").insert(questionRows);
      if (questionsInsertError) {
        await admin.from("course_quizzes").delete().eq("id", quizRow.id);
        throw questionsInsertError;
      }

      try {
        const creditsRemaining = await deductUnified();
        return jsonRes({ quizId: quizRow.id, quiz: { ...quizRow, questions: quiz.questions }, credits_remaining: creditsRemaining, cost });
      } catch (deductError) {
        await admin.from("course_quizzes").delete().eq("id", quizRow.id);
        throw deductError;
      }
    }

    return jsonRes({ error: "Unknown action" }, 400);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[education-ai] ERROR", msg);
    if (msg === "Insufficient credits") return jsonRes({ error: "Insufficient credits" }, 402);
    return jsonRes({ error: msg }, 500);
  }
});
