import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { action, ...params } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const creditCosts: Record<string, number> = {
      mood_journal: 3,
      conversation_starters: 2,
      encouragement_cards: 3,
      life_coach: 4,
    };

    const cost = creditCosts[action];
    if (!cost) throw new Error(`Unknown action: ${action}`);

    // Check credits
    const { data: credits } = await supabase
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    const remaining = credits?.credits_remaining || 0;
    if (remaining < cost) {
      return new Response(JSON.stringify({ error: "Insufficient credits", credits_remaining: remaining, cost }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "mood_journal": {
        systemPrompt = `You are a compassionate AI mood analyst and journal companion. Analyze the user's mood entry and provide deep emotional insights. Return a JSON object with:
- mood_score (1-10 integer)
- mood_label (one word: Happy, Sad, Anxious, Calm, Excited, Stressed, Grateful, Lonely, Motivated, Confused)
- insight (2-3 sentences of empathetic analysis about their emotional state)
- patterns (array of 2-3 emotional patterns you notice)
- suggestion (one actionable self-care suggestion)
- affirmation (a personalized positive affirmation)`;
        userPrompt = `Analyze this mood journal entry: "${params.entry}"`;
        break;
      }
      case "conversation_starters": {
        systemPrompt = `You are a creative friendship conversation designer. Generate engaging, fun, and meaningful conversation starters. Return a JSON object with:
- starters (array of 6 objects, each with: text, category (Fun/Deep/Creative/Nostalgia/Goals/Random), emoji)
- theme (the overall conversational theme you chose)
- tip (a brief tip on how to have better conversations)`;
        userPrompt = params.context 
          ? `Generate conversation starters based on these interests: ${params.context}`
          : `Generate diverse and engaging conversation starters for a best friend chat. Mix fun, deep, and creative topics.`;
        break;
      }
      case "encouragement_cards": {
        systemPrompt = `You are an uplifting AI encouragement specialist. Create beautiful, personalized encouragement cards. Return a JSON object with:
- cards (array of 4 objects, each with: title, message (2-3 inspiring sentences), emoji, color_theme (lavender/coral/mint/gold))
- daily_mantra (a short powerful daily mantra)
- gratitude_prompt (a gratitude reflection question)`;
        userPrompt = params.situation 
          ? `Create encouragement cards for someone going through: ${params.situation}`
          : `Create uplifting encouragement cards for general positivity and self-empowerment.`;
        break;
      }
      case "life_coach": {
        systemPrompt = `You are an expert AI life coach specializing in goal-setting, productivity, and personal growth. Provide structured coaching advice. Return a JSON object with:
- assessment (2-3 sentences analyzing their current situation)
- goals (array of 3 SMART goals, each with: goal, timeline, first_step, motivation)
- action_plan (array of 5 specific daily actions)
- mindset_shift (one key mindset change to focus on)
- accountability_check (a question to ask themselves weekly)
- resources (array of 3 recommended activities or practices)`;
        userPrompt = `Provide life coaching for: "${params.topic}"`;
        break;
      }
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", errText);
      throw new Error("AI service error");
    }

    const aiData = await response.json();
    const result = JSON.parse(aiData.choices[0].message.content);

    // Deduct credits
    await supabase.from("ai_credits").update({
      credits_remaining: remaining - cost,
    }).eq("user_id", user.id);

    // Log usage
    await supabase.from("ai_usage_history").insert({
      user_id: user.id,
      usage_type: `best_friend_${action}`,
      credits_used: cost,
      description: `Best Friend AI: ${action.replace(/_/g, " ")}`,
    });

    // If mood journal, save entry
    if (action === "mood_journal" && result.mood_score) {
      await supabase.from("best_friend_mood_journal").insert({
        user_id: user.id,
        mood_score: result.mood_score,
        mood_label: result.mood_label,
        journal_entry: params.entry,
        ai_insight: result.insight,
        tags: result.patterns || [],
      });
    }

    return new Response(JSON.stringify({ ...result, credits_remaining: remaining - cost }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("best-friend-ai error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message === "Unauthorized" ? 401 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
