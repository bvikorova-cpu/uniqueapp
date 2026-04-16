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

    const { category, gameMode = "classic" } = await req.json();
    if (!category) throw new Error("Category required");

    const entryCost = gameMode === "ranked" ? 20 : gameMode === "blitz" ? 15 : 10;
    const winReward = entryCost * 2;
    const totalQuestions = gameMode === "blitz" ? 5 : 10;
    const timePerQuestion = gameMode === "blitz" ? 10 : 15;

    // Check credits
    const { data: creditData } = await supabase
      .from("brain_duel_credits")
      .select("credits")
      .eq("user_id", user.id)
      .single();

    const currentCredits = creditData?.credits || 0;
    if (currentCredits < entryCost) {
      return new Response(JSON.stringify({ error: "Insufficient credits", required: entryCost, current: currentCredits }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Deduct entry cost
    await supabase
      .from("brain_duel_credits")
      .update({ credits: currentCredits - entryCost })
      .eq("user_id", user.id);

    // Create match (solo vs AI bot)
    const { data: match, error: matchError } = await supabase
      .from("brain_duel_matches")
      .insert({
        category,
        player1_id: user.id,
        player2_id: null,
        status: "ready",
        player1_score: 0,
        player2_score: 0,
        current_question_index: 0,
        total_questions: totalQuestions,
        game_mode: gameMode,
        time_per_question: timePerQuestion,
        entry_cost: entryCost,
        win_reward: winReward,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (matchError) throw matchError;

    return new Response(JSON.stringify({ match }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Matchmaking error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
