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
    if (!authHeader) throw new Error("No auth");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authErr || !user) throw new Error("Unauthorized");

    const { matchId, style } = await req.json();
    if (!matchId) throw new Error("matchId required");

    const CREDITS_COST = 3;
    const commentaryStyle = style || "sports";

    // Check credits
    const { data: credits } = await supabase
      .from("brain_duel_credits")
      .select("credits")
      .eq("user_id", user.id)
      .single();

    if (!credits || credits.credits < CREDITS_COST) {
      return new Response(JSON.stringify({ error: "Insufficient credits. You need 3 credits for AI commentary." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get match data
    const { data: match } = await supabase
      .from("brain_duel_matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (!match) throw new Error("Match not found");

    // Get answers
    const { data: answers } = await supabase
      .from("brain_duel_answers")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at", { ascending: true });

    const stylePrompts: Record<string, string> = {
      sports: "You are an enthusiastic sports commentator narrating an epic brain duel match. Use dramatic language, play-by-play style, crowd reactions, and build tension throughout.",
      esports: "You are a hyped esports caster commentating a competitive brain battle. Use gaming terminology, highlight clutch moments, and add excitement.",
      documentary: "You are a calm, insightful documentary narrator analyzing a fascinating intellectual contest between two minds.",
      comedy: "You are a witty comedy commentator providing hilarious observations about the brain duel. Add funny remarks and unexpected metaphors.",
    };

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const prompt = `Here is a Brain Duel match to commentate:

Category: ${match.category || "General Knowledge"}
Game Mode: ${match.game_mode || "Quick Match"}
Player 1 Score: ${match.player1_score}
Player 2 Score: ${match.player2_score}
Total Questions: ${match.total_questions || 10}
Winner: Player ${match.winner_id === match.player1_id ? "1" : "2"}

Answer timeline (${answers?.length || 0} answers recorded):
${answers?.map((a: any, i: number) => `Round ${i + 1}: ${a.is_correct ? "✅ Correct" : "❌ Wrong"} in ${a.time_taken || "?"}s`).join("\n") || "No detailed answer data available."}

Generate an engaging ${commentaryStyle}-style commentary of this match (200-400 words). Make it dramatic and entertaining!`;

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: stylePrompts[commentaryStyle] || stylePrompts.sports },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI service credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`OpenAI API error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const commentary = aiData.choices?.[0]?.message?.content || "Commentary unavailable.";

    // Deduct credits
    await supabase
      .from("brain_duel_credits")
      .update({ credits: credits.credits - CREDITS_COST })
      .eq("user_id", user.id);

    // Save commentary
    const { data: saved } = await supabase
      .from("brain_duel_ai_commentaries")
      .insert({
        user_id: user.id,
        match_id: matchId,
        commentary,
        style: commentaryStyle,
        credits_used: CREDITS_COST,
      })
      .select()
      .single();

    return new Response(JSON.stringify({ commentary, id: saved?.id, credits_remaining: credits.credits - CREDITS_COST }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("brain-duel-ai-commentary error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
