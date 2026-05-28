import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiKey) throw new Error("OPENAI_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(supabaseUrl, supabaseKey);
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) throw new Error("Not authenticated");

    // Check credits (costs 1 credit)
    const { data: credits } = await supabase
      .from("brain_duel_credits")
      .select("credits")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!credits || credits.credits < 5) {
      return new Response(JSON.stringify({ error: "Insufficient credits. AI recap costs 5 credits." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Gather stats for the last 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    const [matchesResult, answersResult, leagueResult] = await Promise.all([
      supabase
        .from("brain_duel_matches")
        .select("*")
        .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
        .eq("status", "finished")
        .gte("created_at", weekAgo),
      supabase
        .from("brain_duel_answers")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", weekAgo),
      supabase
        .from("brain_duel_leagues")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    const matches = matchesResult.data || [];
    const answers = answersResult.data || [];

    const wins = matches.filter((m: any) => m.winner_id === user.id).length;
    const losses = matches.length - wins;
    const correctAnswers = answers.filter((a: any) => a.is_correct).length;
    const totalAnswers = answers.length;
    const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
    const avgTime = totalAnswers > 0 ? Math.round(answers.reduce((sum: number, a: any) => sum + (a.time_taken || 0), 0) / totalAnswers) : 0;

    const statsSnapshot = {
      matches_played: matches.length,
      wins,
      losses,
      correct_answers: correctAnswers,
      total_answers: totalAnswers,
      accuracy,
      avg_answer_time: avgTime,
      league: leagueResult.data?.league || "unranked",
      elo: leagueResult.data?.elo_rating || 1000,
    };

    // Generate AI recap
    const prompt = `You are a competitive gaming analyst for "BrainDuel" — a real-time knowledge quiz battle game. Generate an engaging, motivational weekly performance recap for a player. Be specific with numbers, use emojis sparingly, and give 2-3 concrete improvement tips.

Player Stats This Week:
- Matches Played: ${statsSnapshot.matches_played}
- Wins: ${wins}, Losses: ${losses} (${statsSnapshot.matches_played > 0 ? Math.round((wins / statsSnapshot.matches_played) * 100) : 0}% win rate)
- Questions Answered: ${totalAnswers} (${accuracy}% accuracy)
- Average Answer Time: ${avgTime}s
- Current League: ${statsSnapshot.league}
- ELO Rating: ${statsSnapshot.elo}

Write a 150-200 word recap with sections: Performance Summary, Highlights, Areas to Improve, and a motivational closing. Format with markdown.`;

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a competitive gaming coach who writes engaging weekly performance recaps." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "AI rate limited. Try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Contact support." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("OpenAI API error");
    }

    const aiData = await aiResponse.json();
    const recapText = aiData.choices?.[0]?.message?.content || "Unable to generate recap.";

    // Deduct credits
    await supabase
      .from("brain_duel_credits")
      .update({ credits: credits.credits - 5 })
      .eq("user_id", user.id);

    // Save recap
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const weekEnd = new Date().toISOString().split("T")[0];

    const { data: recap, error: recapError } = await supabase
      .from("brain_duel_ai_recaps")
      .insert({
        user_id: user.id,
        recap_text: recapText,
        week_start: weekStart,
        week_end: weekEnd,
        stats_snapshot: statsSnapshot,
        credits_used: 5,
      })
      .select()
      .single();

    if (recapError) throw recapError;

    return new Response(JSON.stringify({ recap, stats: statsSnapshot }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
