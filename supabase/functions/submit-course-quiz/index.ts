import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAuth = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseAuth.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("Unauthorized");

    const { quizId, answers, enrollmentId } = await req.json();
    
    if (!quizId || !answers || !enrollmentId) {
      throw new Error("Missing required fields");
    }

    // Use service role for DB operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get quiz questions
    const { data: questions, error: questionsError } = await supabaseClient
      .from("quiz_questions")
      .select("id, options")
      .eq("quiz_id", quizId);

    if (questionsError) throw questionsError;

    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = questions.length;

    questions.forEach((question: any) => {
      const userAnswer = answers[question.id];
      const correctOption = question.options.find((opt: any) => opt.isCorrect);
      if (userAnswer === correctOption?.text) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Get passing score
    const { data: quiz } = await supabaseClient
      .from("course_quizzes")
      .select("passing_score")
      .eq("id", quizId)
      .single();

    const passed = score >= (quiz?.passing_score || 70);

    // Get attempt number
    const { data: previousAttempts } = await supabaseClient
      .from("user_quiz_attempts")
      .select("attempt_number")
      .eq("user_id", user.id)
      .eq("quiz_id", quizId)
      .order("attempt_number", { ascending: false })
      .limit(1);

    const attemptNumber = previousAttempts && previousAttempts.length > 0
      ? previousAttempts[0].attempt_number + 1
      : 1;

    // Record attempt
    const { error: insertError } = await supabaseClient
      .from("user_quiz_attempts")
      .insert({
        user_id: user.id,
        quiz_id: quizId,
        enrollment_id: enrollmentId,
        score,
        answers,
        passed,
        attempt_number: attemptNumber,
      });

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ score, passed, correctAnswers, totalQuestions }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
