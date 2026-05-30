import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Early auth pre-check (returns 401 instead of crashing inside try → 500)
  const _earlyAuth = req.headers.get("Authorization");
  if (!_earlyAuth || !_earlyAuth.toLowerCase().startsWith("bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

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

    const { match_id } = await req.json();
    if (!match_id) throw new Error("match_id required");

    const ANALYSIS_COST = 5;

    // Check credits
    const { data: creditData } = await supabase
      .from("brain_duel_credits")
      .select("credits")
      .eq("user_id", user.id)
      .single();

    const currentCredits = creditData?.credits || 0;
    if (currentCredits < ANALYSIS_COST) {
      return new Response(JSON.stringify({ error: "Insufficient credits", required: ANALYSIS_COST, current: currentCredits }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get match data
    const { data: match } = await supabase
      .from("brain_duel_matches")
      .select("*")
      .eq("id", match_id)
      .single();

    if (!match) throw new Error("Match not found");

    // Get player answers with questions
    const { data: answers } = await supabase
      .from("brain_duel_answers")
      .select("*, brain_duel_questions(*)")
      .eq("match_id", match_id)
      .eq("player_id", user.id);

    const totalQ = answers?.length || 0;
    const correct = answers?.filter((a: any) => a.is_correct).length || 0;
    const accuracy = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;

    const wrongAnswers = answers?.filter((a: any) => !a.is_correct).map((a: any) => ({
      question: a.brain_duel_questions?.question,
      your_answer: a.answer,
      correct_answer: a.brain_duel_questions?.correct_answer,
    })) || [];

    // AI Analysis
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("AI not configured");

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
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
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "AI rate limited. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices?.[0]?.message?.content || "Analysis unavailable.";

    // Deduct credits
    await supabase
      .from("brain_duel_credits")
      .update({ credits: currentCredits - ANALYSIS_COST })
      .eq("user_id", user.id);

    return new Response(JSON.stringify({
      analysis,
      stats: { accuracy, correct, total: totalQ, wrong_answers: wrongAnswers },
      credits_spent: ANALYSIS_COST,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Match analysis error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
