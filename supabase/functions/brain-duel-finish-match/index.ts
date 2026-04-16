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

    const { match_id } = await req.json();
    if (!match_id) throw new Error("match_id required");

    const { data: match } = await supabase
      .from("brain_duel_matches")
      .select("*")
      .eq("id", match_id)
      .single();

    if (!match) throw new Error("Match not found");
    if (match.status === "finished") {
      return new Response(JSON.stringify({ match }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine winner
    let winnerId = null;
    if (match.player1_score > match.player2_score) winnerId = match.player1_id;
    else if (match.player2_score > match.player1_score) winnerId = match.player2_id || "ai_bot";

    const { data: updatedMatch } = await supabase
      .from("brain_duel_matches")
      .update({
        status: "finished",
        winner_id: winnerId === "ai_bot" ? null : winnerId,
        finished_at: new Date().toISOString(),
      })
      .eq("id", match_id)
      .select()
      .single();

    // Award credits to winner
    const isPlayerWinner = winnerId === user.id;
    if (isPlayerWinner && match.win_reward) {
      const { data: creditData } = await supabase
        .from("brain_duel_credits")
        .select("credits")
        .eq("user_id", user.id)
        .single();

      if (creditData) {
        await supabase
          .from("brain_duel_credits")
          .update({ credits: creditData.credits + match.win_reward })
          .eq("user_id", user.id);
      }
    }

    // Get answer details for summary
    const { data: answers } = await supabase
      .from("brain_duel_answers")
      .select("*")
      .eq("match_id", match_id)
      .eq("player_id", user.id);

    const totalAnswered = answers?.length || 0;
    const correctAnswers = answers?.filter((a: any) => a.is_correct).length || 0;

    return new Response(JSON.stringify({
      match: updatedMatch,
      is_winner: isPlayerWinner,
      is_draw: winnerId === null && match.player1_score === match.player2_score,
      credits_earned: isPlayerWinner ? match.win_reward : 0,
      stats: {
        total_questions: totalAnswered,
        correct_answers: correctAnswers,
        accuracy: totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Finish match error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
