import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CREDIT_COSTS: Record<string, number> = {
  talent_coach: 4,
  thumbnail_generator: 3,
  trend_analyzer: 3,
  performance_score: 4,
  viral_predictor: 4,
  music_advisor: 3,
  caption_writer: 3,
  collaboration_matcher: 4,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiKey = Deno.env.get("OPENAI_API_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(supabaseUrl, supabaseKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { action, ...params } = await req.json();
    const creditCost = CREDIT_COSTS[action];
    if (!creditCost) throw new Error(`Unknown action: ${action}`);

    const { data: credits } = await supabase
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    const remaining = credits?.credits_remaining || 0;
    if (remaining < creditCost) {
      return new Response(JSON.stringify({ error: `Not enough credits. Need ${creditCost}, have ${remaining}.` }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "talent_coach":
        systemPrompt = `You are an elite talent coach and performance expert. Analyze the user's talent submission and provide detailed, actionable coaching advice. Return JSON: { "overall_assessment": "string", "strengths": ["str"], "areas_to_improve": ["str"], "specific_tips": [{"area": "str", "tip": "str", "priority": "high|medium|low"}], "practice_routine": {"daily": ["str"], "weekly": ["str"]}, "competition_strategy": "string", "confidence_score": number 1-100, "next_milestone": "string" }`;
        userPrompt = `Analyze this talent submission and provide coaching:\nCategory: ${params.category}\nTitle: ${params.title}\nDescription: ${params.description}\nMedia type: ${params.mediaType || "image"}`;
        break;

      case "thumbnail_generator":
        systemPrompt = `You are a creative director specializing in viral social media thumbnails. Generate detailed thumbnail concepts for talent submissions. Return JSON: { "concepts": [{"title": "str", "description": "str", "color_scheme": "str", "text_overlay": "str", "composition": "str", "emotional_hook": "str", "click_probability": number 1-100}], "best_practices": ["str"], "category_insights": "string", "viral_elements": ["str"] }`;
        userPrompt = `Create 3 thumbnail concepts for:\nCategory: ${params.category}\nTitle: ${params.title}\nDescription: ${params.description}`;
        break;

      case "trend_analyzer":
        systemPrompt = `You are a social media trend analyst and talent competition strategist. Analyze current trends and provide insights. Return JSON: { "trending_categories": [{"name": "str", "growth": "str", "opportunity_score": number 1-100, "reason": "str"}], "emerging_trends": [{"trend": "str", "description": "str", "timeframe": "str"}], "content_recommendations": [{"type": "str", "description": "str", "expected_engagement": "str"}], "best_posting_times": [{"day": "str", "time": "str", "reason": "str"}], "competitive_landscape": "string", "viral_prediction": "string" }`;
        userPrompt = `Analyze trends for the talent competition platform. ${params.category ? `Focus on category: ${params.category}` : "General overview across all categories."}`;
        break;

      case "performance_score":
        systemPrompt = `You are a professional talent evaluator and judge. Score the submission across multiple dimensions. Return JSON: { "total_score": number 1-100, "dimensions": [{"name": "str", "score": number 1-100, "feedback": "str"}], "rank_estimate": "str", "star_rating": number 1-5, "judge_commentary": "string", "winning_potential": number 1-100, "improvement_roadmap": [{"step": number, "action": "str", "expected_impact": "str"}], "comparable_winners": "string" }`;
        userPrompt = `Evaluate this talent submission:\nCategory: ${params.category}\nTitle: ${params.title}\nDescription: ${params.description}\nMedia type: ${params.mediaType || "image"}`;
        break;

      case "viral_predictor":
        systemPrompt = `You are a viral content analyst specializing in talent competitions and social media virality. Predict the viral potential of a submission. Return JSON: { "viral_score": number 1-100, "verdict": "string (one sentence summary)", "factors": [{"name": "str (e.g. Uniqueness, Emotional Hook, Shareability, Trend Alignment, Production Quality)", "score": number 1-100, "insight": "str"}], "boost_suggestions": ["str (5 actionable tips to increase virality)"], "best_posting_strategy": "string", "estimated_reach": "string", "comparable_viral_content": "string" }`;
        userPrompt = `Predict the viral potential of this talent submission:\nCategory: ${params.category}\nTitle: ${params.title}\nDescription: ${params.description}`;
        break;

      case "music_advisor":
        systemPrompt = `You are a music supervisor and sound designer for viral social media content. Recommend perfect music and sound for talent videos. Return JSON: { "recommendations": [{"song_title": "str", "artist": "str", "genre": "str", "bpm": number, "mood": "str", "reason": "str", "license": "str (e.g. Royalty-free, Creative Commons, Popular - check rights)"}], "sound_effects": ["str (3-4 sound design tips)"], "editing_tips": "string", "audio_mixing_advice": "string", "trending_sounds": ["str"] }. Provide 4-5 song recommendations.`;
        userPrompt = `Recommend music/sound for this talent video:\nCategory: ${params.category}\nContent type: ${params.contentType}\nMood: ${params.mood || "not specified"}\nDescription: ${params.description || "not specified"}`;
        break;

      case "caption_writer":
        systemPrompt = `You are a professional social media copywriter specializing in talent showcases and viral content. Write engaging captions with hashtags. Return JSON: { "captions": [{"style": "str (e.g. Inspirational, Casual, Bold, Story-driven)", "caption": "str (max 200 chars)", "hashtags": ["str (5-8 relevant hashtags with #)"]}], "call_to_action": "string", "engagement_tips": ["str (3-4 tips)"], "best_emoji_strategy": "string" }. Provide 3 different caption styles.`;
        userPrompt = `Write captions for this talent submission:\nCategory: ${params.category}\nTitle: ${params.title}\nDescription: ${params.description || "not specified"}\nTone: ${params.tone || "not specified"}`;
        break;

      case "collaboration_matcher":
        systemPrompt = `You are a talent collaboration strategist who connects creators for powerful partnerships. Generate collaboration ideas and partner profiles. Return JSON: { "collaboration_ideas": [{"title": "str", "description": "str", "skills_needed": ["str"], "viral_potential": number 1-10, "difficulty": "str (Easy/Medium/Hard)", "expected_outcome": "str"}], "tips": ["str (4-5 collaboration tips)"], "platform_strategy": "string", "success_stories": "string" }. Provide 4-5 collaboration ideas.`;
        userPrompt = `Find collaboration ideas for:\nMy talent: ${params.myTalent}\nLooking for: ${params.lookingFor}\nDescription: ${params.description || "not specified"}`;
        break;
    }

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_completion_tokens: 2000,
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("OpenAI error:", errorText);
      throw new Error("AI service error");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content;
    const parsed = JSON.parse(content);

    await supabase
      .from("ai_credits")
      .update({ credits_remaining: remaining - creditCost })
      .eq("user_id", user.id);

    return new Response(JSON.stringify({ ...parsed, credits_used: creditCost, credits_remaining: remaining - creditCost }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("megatalent-ai error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});