import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Not authenticated");

    const { match_id, question_id, answer, time_taken } = await req.json();
    if (!match_id || !question_id) throw new Error("match_id and question_id required");

    // Get correct answer
    const { data: question } = await supabase
      .from("brain_duel_questions")
      .select("correct_answer")
      .eq("id", question_id)
      .single();

    if (!question) throw new Error("Question not found");

    const norm = (s: any) => String(s ?? "").trim().toLowerCase();
    const isCorrect = norm(answer) === norm(question.correct_answer);

    // Calculate points (faster = more points)
    const basePoints = isCorrect ? 100 : 0;
    const timeBonus = isCorrect ? Math.max(0, Math.floor((15 - (time_taken || 15)) * 10)) : 0;
    const totalPoints = basePoints + timeBonus;

    // Save answer
    await supabase.from("brain_duel_answers").insert({
      match_id,
      question_id,
      player_id: user.id,
      answer: answer || "timeout",
      is_correct: isCorrect,
    });

    // Update match score
    const { data: match } = await supabase
      .from("brain_duel_matches")
      .select("*")
      .eq("id", match_id)
      .single();

    if (!match) throw new Error("Match not found");

    const isPlayer1 = match.player1_id === user.id;
    const newScore = (isPlayer1 ? match.player1_score : match.player2_score) + totalPoints;

    // Simulate AI opponent answer (60% accuracy for bot)
    const aiCorrect = Math.random() < 0.6;
    const aiPoints = aiCorrect ? 100 + Math.floor(Math.random() * 80) : 0;
    const aiNewScore = (isPlayer1 ? match.player2_score : match.player1_score) + aiPoints;

    const updateData: any = {
      current_question_index: match.current_question_index + 1,
    };
    if (isPlayer1) {
      updateData.player1_score = newScore;
      updateData.player2_score = aiNewScore;
    } else {
      updateData.player2_score = newScore;
      updateData.player1_score = aiNewScore;
    }

    await supabase.from("brain_duel_matches").update(updateData).eq("id", match_id);

    return new Response(JSON.stringify({
      is_correct: isCorrect,
      correct_answer: question.correct_answer,
      points_earned: totalPoints,
      new_score: newScore,
      opponent_score: aiNewScore,
      ai_was_correct: aiCorrect,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Submit answer error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
