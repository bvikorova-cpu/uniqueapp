import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

type WrongAnswer = {
  question?: string;
  your_answer?: string;
  correct_answer?: string;
};

type MatchRow = {
  category?: string;
  winner_id?: string | null;
  player1_id?: string;
  player2_id?: string;
  player1_score?: number | null;
  player2_score?: number | null;
  game_mode?: string | null;
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const buildFallbackAnalysis = ({
  match,
  userId,
  accuracy,
  correct,
  totalQ,
  wrongAnswers,
}: {
  match: MatchRow;
  userId: string;
  accuracy: number;
  correct: number;
  totalQ: number;
  wrongAnswers: WrongAnswer[];
}) => {
  const playerScore = match.player1_id === userId ? match.player1_score ?? 0 : match.player2_score ?? 0;
  const opponentScore = match.player1_id === userId ? match.player2_score ?? 0 : match.player1_score ?? 0;
  const result = match.winner_id === userId ? "win" : playerScore === opponentScore ? "draw" : "loss";
  const category = match.category || "Brain Duel";
  const topMisses = wrongAnswers
    .filter((item) => item.question)
    .slice(0, 3)
    .map((item) => `- Review: ${item.question} — correct answer: ${item.correct_answer || "not available"}`)
    .join("\n");
  const performanceLine = accuracy >= 85
    ? "Excellent accuracy — keep pushing speed and consistency."
    : accuracy >= 60
      ? "Solid base — a few targeted reviews can quickly lift your score."
      : "Focus on fundamentals first, then increase pace once answers feel automatic.";
  const eloHint = result === "win"
    ? "Expected ELO impact: positive if the match was saved successfully."
    : result === "draw"
      ? "Expected ELO impact: mostly neutral, depending on opponent rating."
      : "Expected ELO impact: small decrease, with recovery possible in the next duel.";

  return `## Performance Summary\n${performanceLine}\n\nYou scored **${playerScore} vs ${opponentScore}** in **${category}** (${match.game_mode || "classic"}), with **${accuracy}% accuracy** (${correct}/${totalQ}).\n\n## Strengths\n- You completed the match and generated real saved performance stats.\n- ${correct > 0 ? `You answered ${correct} question${correct === 1 ? "" : "s"} correctly.` : "This round gives you a clear baseline for improvement."}\n- ${wrongAnswers.length === 0 ? "Perfect question accuracy — maintain this rhythm." : "Missed answers are now isolated for focused review."}\n\n## Areas to Improve\n${wrongAnswers.length > 0 ? topMisses : "- No missed questions detected in this match."}\n\n## Study Tips\n- Revisit the weakest facts from this round before replaying the same category.\n- Aim for accuracy first; speed matters more after you consistently pass 80%.\n- Play one quick duel, review mistakes, then repeat the category once.\n\n## Predicted ELO Impact\n${eloHint}\n\n## Keep Going\nAI coach is temporarily rate-limited, so this backup analysis used your real match data and did not charge credits.`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Early auth pre-check (returns 401 instead of crashing inside try → 500)
  const _earlyAuth = req.headers.get("Authorization");
  if (!_earlyAuth || !_earlyAuth.toLowerCase().startsWith("bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: "Supabase is not configured" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Unauthorized" }, 401);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return jsonResponse({ error: "Not authenticated" }, 401);

    let body: { match_id?: unknown };
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid request body" }, 400);
    }

    const match_id = typeof body.match_id === "string" ? body.match_id.trim() : "";
    if (!match_id) return jsonResponse({ error: "match_id required" }, 400);

    const ANALYSIS_COST = 5;

    // Check unified AI credits
    const { data: creditData } = await supabase
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    const currentCredits = creditData?.credits_remaining || 0;
    if (currentCredits < ANALYSIS_COST) {
      return jsonResponse({ error: "Insufficient credits", required: ANALYSIS_COST, current: currentCredits }, 400);
    }

    // Get match data
    const { data: match } = await supabase
      .from("brain_duel_matches")
      .select("*")
      .eq("id", match_id)
      .single();

    if (!match) return jsonResponse({ error: "Match not found" }, 404);
    if (match.player1_id !== user.id && match.player2_id !== user.id) {
      return jsonResponse({ error: "You can only analyze your own matches" }, 403);
    }

    // Get player answers with questions
    const { data: answers } = await supabase
      .from("brain_duel_answers")
      .select("*, brain_duel_questions(*)")
      .eq("match_id", match_id)
      .eq("player_id", user.id);

    const totalQ = answers?.length || 0;
    const correct = answers?.filter((a: any) => a.is_correct).length || 0;
    const accuracy = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;

    const wrongAnswers = answers?.filter((a: any) => !a.is_correct).map((a: any) => ({ question: a.brain_duel_questions?.question,
      your_answer: a.answer,
      correct_answer: a.brain_duel_questions?.correct_answer })) || [];

    // AI Analysis
    const fallbackAnalysis = () => buildFallbackAnalysis({
      match,
      userId: user.id,
      accuracy,
      correct,
      totalQ,
      wrongAnswers,
    });

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return jsonResponse({
        analysis: fallbackAnalysis(),
        stats: { accuracy, correct, total: totalQ, wrong_answers: wrongAnswers },
        credits_spent: 0,
        analysis_source: "fallback",
        warning: "AI coach is temporarily unavailable; backup analysis used real match data.",
      });
    }

    let aiResponse: Response;
    try {
      aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an expert quiz coach. Analyze the player's performance and give actionable advice. Be encouraging but honest. Format with headers and bullet points."
            },
            {
              role: "user",
              content: `Analyze this Brain Duel match performance:

Category: ${match.category}
Result: ${match.winner_id === user.id ? "WIN" : match.player1_score === match.player2_score ? "DRAW" : "LOSS"}
Score: ${match.player1_id === user.id ? match.player1_score : match.player2_score} vs ${match.player1_id === user.id ? match.player2_score : match.player1_score}
Accuracy: ${accuracy}% (${correct}/${totalQ} correct)
Game Mode: ${match.game_mode || "classic"}

Questions answered incorrectly:
${wrongAnswers.map((w: any) => `- "${w.question}" → You answered "${w.your_answer}", correct was "${w.correct_answer}"`).join("\n") || "None - perfect score!"}

Provide:
1. Performance Summary (2-3 sentences)
2. Strengths (what they did well)
3. Areas to Improve (specific knowledge gaps)
4. Study Tips (actionable recommendations for the category)
5. Predicted ELO Impact
6. Motivational closing`
            }
          ] }) });
    } catch (aiError) {
      console.warn("OpenAI match analysis request failed, using fallback:", aiError);
      return jsonResponse({
        analysis: fallbackAnalysis(),
        stats: { accuracy, correct, total: totalQ, wrong_answers: wrongAnswers },
        credits_spent: 0,
        analysis_source: "fallback",
        warning: "AI coach is temporarily unavailable; backup analysis used real match data.",
      });
    }

    if (!aiResponse.ok) {
      console.warn("OpenAI match analysis returned non-2xx, using fallback:", aiResponse.status);
      return jsonResponse({
        analysis: fallbackAnalysis(),
        stats: { accuracy, correct, total: totalQ, wrong_answers: wrongAnswers },
        credits_spent: 0,
        analysis_source: "fallback",
        warning: aiResponse.status === 429
          ? "AI coach is rate-limited; backup analysis used real match data."
          : "AI coach is temporarily unavailable; backup analysis used real match data.",
      });
    }

    let aiData: any;
    try {
      aiData = await aiResponse.json();
    } catch (parseError) {
      console.warn("OpenAI match analysis response parse failed, using fallback:", parseError);
      return jsonResponse({
        analysis: fallbackAnalysis(),
        stats: { accuracy, correct, total: totalQ, wrong_answers: wrongAnswers },
        credits_spent: 0,
        analysis_source: "fallback",
        warning: "AI coach returned an unreadable response; backup analysis used real match data.",
      });
    }
    const analysis = aiData.choices?.[0]?.message?.content || fallbackAnalysis();

    const { data: deducted, error: deductError } = await supabase.rpc("deduct_ai_credits", {
      p_user_id: user.id,
      p_amount: ANALYSIS_COST,
      p_reason: "brain_duel_match_analysis",
      p_source: "brain_duel"
    });
    if (deductError || deducted === false) {
      return jsonResponse({ error: "Insufficient credits", required: ANALYSIS_COST, current: currentCredits }, 400);
    }

    return jsonResponse({
      analysis,
      stats: { accuracy, correct, total: totalQ, wrong_answers: wrongAnswers },
      credits_spent: ANALYSIS_COST,
      analysis_source: "openai" });
  } catch (e) {
    console.error("Match analysis error:", e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Match analysis failed" }, 500);
  }
});
