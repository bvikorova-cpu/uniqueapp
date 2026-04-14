import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CREDIT_COSTS: Record<string, number> = {
  post_enhancer: 4,
  content_calendar: 5,
  audience_insights: 5,
  viral_predictor: 4,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, ...params } = await req.json();
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OPENAI_API_KEY not configured");

    const supabase = createClient(supabaseUrl, supabaseKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const creditCost = CREDIT_COSTS[action] || 5;

    const { data: credits } = await supabase
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    const remaining = credits?.credits_remaining || 0;
    if (remaining < creditCost) {
      return new Response(JSON.stringify({ error: `Insufficient credits. Need ${creditCost}, have ${remaining}. Purchase more credits to continue.` }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "post_enhancer":
        systemPrompt = "You are an elite social media copywriter and engagement specialist. You rewrite and optimize posts for maximum engagement, virality, and emotional impact. You understand platform algorithms, hook writing, and audience psychology. Output enhanced versions with explanations.";
        userPrompt = `Enhance and optimize this social media post for maximum engagement:

Original Post: "${params.original_post || "No content provided"}"
Tone: ${params.tone || "Professional yet approachable"}
Target Audience: ${params.target_audience || "General social media users"}
Goal: ${params.goal || "Maximum engagement"}

Provide:
1. **Enhanced Version** — The optimized post with powerful hooks, emotional triggers, and clear CTA
2. **Hashtag Strategy** — 10-15 relevant hashtags grouped by reach (high/medium/niche)
3. **Hook Variations** — 3 alternative opening lines ranked by engagement potential
4. **Emoji Strategy** — Strategic emoji placement suggestions
5. **Best Posting Time** — Recommended posting windows
6. **Engagement Score** — Rate the enhanced post (1-100) vs. original
7. **Why It Works** — Brief explanation of the psychology behind the enhancements`;
        break;

      case "content_calendar":
        systemPrompt = "You are a social media strategist and content planning expert. You create detailed, actionable content calendars with optimal posting times, content themes, engagement strategies, and growth tactics. You understand algorithmic trends and audience behavior patterns.";
        userPrompt = `Create a comprehensive weekly content calendar:

Niche/Topic: ${params.niche || "General lifestyle"}
Content Style: ${params.content_style || "Mixed (photos, text, stories)"}
Target Audience: ${params.target_audience || "18-35 general audience"}
Goals: ${params.goals || "Grow engagement and followers"}
Current Followers: ${params.followers || "Not specified"}
Posting Frequency: ${params.frequency || "Daily"}

Generate a 7-day content calendar with:
1. **Daily Content Plan** — Specific post ideas with captions for each day (Mon-Sun)
2. **Content Mix** — Photo posts, stories, polls, carousels, live sessions ratio
3. **Theme Days** — Recurring themed content (e.g., Motivation Monday, Throwback Thursday)
4. **Optimal Posting Times** — Best times for each day based on platform algorithms
5. **Hashtag Sets** — Rotating hashtag groups to maximize reach
6. **Engagement Tasks** — Daily engagement activities (commenting, collaborating, sharing)
7. **Weekly Goals** — Measurable targets for the week
8. **Content Pillars** — 4-5 core themes to rotate between`;
        break;

      case "audience_insights":
        systemPrompt = "You are a social media analytics expert and audience behavior analyst. You provide deep, actionable insights about audience demographics, engagement patterns, content performance, and growth strategies. You turn raw observations into strategic recommendations.";
        userPrompt = `Analyze and provide insights for this social media profile:

Profile Description: ${params.profile_description || "Not specified"}
Content Type: ${params.content_type || "Mixed content"}
Current Engagement: ${params.engagement_rate || "Not specified"}
Top Performing Posts: ${params.top_posts || "Not specified"}
Follower Count: ${params.followers || "Not specified"}
Primary Platform: ${params.platform || "Social media"}
Pain Points: ${params.challenges || "Low engagement, slow growth"}

Provide comprehensive analysis:
1. **Audience Demographics Prediction** — Likely age, interests, and behavior patterns
2. **Engagement Pattern Analysis** — When your audience is most active and responsive
3. **Content Performance Matrix** — Which content types work best and why
4. **Growth Opportunities** — Untapped niches and trending topics in your space
5. **Competitor Benchmarking** — How you compare to similar profiles
6. **Actionable Recommendations** — Top 10 specific actions to boost engagement
7. **Content Gap Analysis** — Missing content types your audience craves
8. **Monetization Readiness** — Assessment of your profile's commercial potential
9. **Risk Assessment** — Potential audience fatigue indicators`;
        break;

      case "viral_predictor":
        systemPrompt = "You are a viral content analyst and social media algorithm expert. You score posts on their viral potential using data-driven criteria including emotional triggers, shareability, timing, format optimization, and platform-specific factors. Be specific with predictions and metrics.";
        userPrompt = `Score and analyze this post for viral potential:

Post Content: "${params.post_content || "No content provided"}"
Post Type: ${params.post_type || "Text post"}
Target Audience: ${params.target_audience || "General"}
Posting Time: ${params.posting_time || "Not specified"}
Include Hashtags: ${params.hashtags || "None specified"}

Provide viral analysis:
1. **Viral Score** — Rate 1-100 with detailed breakdown
2. **Shareability Index** — How likely people are to share (1-10)
3. **Emotional Resonance** — Which emotions this triggers and their strength
4. **Algorithm Friendliness** — How well this performs with platform algorithms
5. **Engagement Prediction** — Estimated likes, comments, shares range
6. **Improvement Suggestions** — Specific tweaks to increase viral potential by 20%+
7. **Risk Factors** — Elements that could hurt performance
8. **Optimal Enhancements** — Suggested media, format, or timing changes
9. **Comparison** — How this compares to viral posts in similar niches
10. **Final Verdict** — Go/Revise/Rethink with specific reasoning`;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 3000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", errText);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;
    if (!result) throw new Error("No AI response");

    await supabase
      .from("ai_credits")
      .update({ credits_remaining: remaining - creditCost })
      .eq("user_id", user.id);

    await supabase.from("ai_usage_history").insert({
      user_id: user.id,
      usage_type: `wall_${action}`,
      credits_used: creditCost,
      description: `Wall AI: ${action}`,
    });

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("wall-ai error:", e);
    return new Response(JSON.stringify({ error: e.message || "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
