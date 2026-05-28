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

    const { action, challengeId, score, timeTaken } = await req.json();

    if (action === "get-today") {
      // Get or generate today's challenge
      const today = new Date().toISOString().split("T")[0];
      let { data: challenge } = await supabase
        .from("brain_duel_daily_challenges")
        .select("*")
        .eq("challenge_date", today)
        .single();

      if (!challenge) {
        // Generate a new daily challenge using AI
        const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
        const categories = ["science", "history", "geography", "film", "music", "sports", "art", "food", "business", "gaming"];
        const category = categories[Math.floor(Math.random() * categories.length)];
        
        let title = `Daily ${category.charAt(0).toUpperCase() + category.slice(1)} Challenge`;
        let description = `Test your ${category} knowledge in today's speed challenge!`;

        if (OPENAI_API_KEY) {
          try {
            const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                  { role: "system", content: "Generate a catchy title and description for a daily brain quiz challenge. Reply with JSON: {\"title\": \"...\", \"description\": \"...\"}" },
                  { role: "user", content: `Category: ${category}. Make it exciting and fun!` },
                ],
              }),
            });
            if (aiRes.ok) {
              const aiData = await aiRes.json();
              const content = aiData.choices?.[0]?.message?.content || "";
              try {
                const parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, ""));
                title = parsed.title || title;
                description = parsed.description || description;
              } catch {}
            }
          } catch {}
        }

        const { data: newChallenge } = await supabase
          .from("brain_duel_daily_challenges")
          .insert({
            challenge_date: today,
            category,
            title,
            description,
            question_count: 5,
            time_limit: 60,
            reward_credits: 15,
          })
          .select()
          .single();
        challenge = newChallenge;
      }

      // Get leaderboard
      const { data: entries } = await supabase
        .from("brain_duel_daily_challenge_entries")
        .select("*")
        .eq("challenge_id", challenge?.id)
        .order("score", { ascending: false })
        .order("time_taken", { ascending: true })
        .limit(50);

      // Get profiles for leaderboard
      const userIds = entries?.map((e: any) => e.user_id) || [];
      const { data: profiles } = userIds.length > 0
        ? await supabase.from("profiles").select("id, full_name, avatar_url").in("id", userIds)
        : { data: [] };

      const leaderboard = entries?.map((e: any) => ({
        ...e,
        profile: profiles?.find((p: any) => p.id === e.user_id),
      })) || [];

      // Check if user already submitted
      const userEntry = entries?.find((e: any) => e.user_id === user.id);

      return new Response(JSON.stringify({ challenge, leaderboard, userEntry }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "submit") {
      if (!challengeId || score === undefined || timeTaken === undefined) {
        throw new Error("Missing required fields");
      }

      // Check if already submitted
      const { data: existing } = await supabase
        .from("brain_duel_daily_challenge_entries")
        .select("id")
        .eq("challenge_id", challengeId)
        .eq("user_id", user.id)
        .single();

      if (existing) {
        return new Response(JSON.stringify({ error: "Already submitted today's challenge" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: entry } = await supabase
        .from("brain_duel_daily_challenge_entries")
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          score,
          time_taken: timeTaken,
        })
        .select()
        .single();

      // Award credits if good score
      const { data: challenge } = await supabase
        .from("brain_duel_daily_challenges")
        .select("reward_credits, question_count")
        .eq("id", challengeId)
        .single();

      if (challenge && score >= Math.ceil((challenge.question_count || 5) * 0.6)) {
        const { data: credits } = await supabase
          .from("brain_duel_credits")
          .select("credits")
          .eq("user_id", user.id)
          .single();

        if (credits) {
          await supabase
            .from("brain_duel_credits")
            .update({ credits: credits.credits + (challenge.reward_credits || 10) })
            .eq("user_id", user.id);
        }
      }

      return new Response(JSON.stringify({ entry, reward: challenge?.reward_credits }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid action");
  } catch (e: any) {
    console.error("brain-duel-daily-challenge error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
