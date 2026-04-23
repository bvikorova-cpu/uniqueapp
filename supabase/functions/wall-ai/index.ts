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
  hashtag_generator: 3,
  collab_matchmaker: 5,
  content_repurposer: 4,
  bot_detector: 5,
  mood_feed: 4,
  voice_post: 4,
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

      case "hashtag_generator":
        systemPrompt = "You are a social media hashtag strategist and trending topics analyst. You generate highly optimized hashtag sets that maximize reach, discoverability, and engagement. You understand platform algorithms and hashtag ranking systems.";
        userPrompt = `Generate an optimized hashtag strategy for this content:

Content/Topic: "${params.content || "Not provided"}"
Niche: ${params.niche || "General"}
Platform: ${params.platform || "Social media"}
Goal: ${params.goal || "Maximum reach"}

Provide:
1. **Power Hashtags (5)** — High-volume, trending hashtags with 1M+ posts
2. **Niche Hashtags (10)** — Medium-volume, targeted hashtags (100K-1M posts)
3. **Micro Hashtags (10)** — Low-competition, high-engagement hashtags (<100K posts)
4. **Branded Hashtag Suggestions (3)** — Unique hashtags for personal branding
5. **Trending Now** — 5 currently trending hashtags related to this content
6. **Banned/Shadowban Risk** — Hashtags to avoid and why
7. **Optimal Placement Strategy** — Where and how to place hashtags
8. **Hashtag Rotation Schedule** — Weekly rotation plan to avoid algorithm penalties
9. **Performance Prediction** — Estimated reach boost percentage`;
        break;

      case "collab_matchmaker":
        systemPrompt = "You are a social media collaboration strategist and influencer partnership expert. You analyze profiles and suggest ideal collaboration partners, content ideas, and partnership strategies for mutual growth.";
        userPrompt = `Find ideal collaboration partners and strategies:

Your Profile: ${params.profile_description || "Not specified"}
Your Niche: ${params.niche || "General"}
Follower Count: ${params.followers || "Not specified"}
Content Style: ${params.content_style || "Mixed"}
Goals: ${params.goals || "Grow audience through collaborations"}
Preferred Collab Type: ${params.collab_type || "Any"}

Provide:
1. **Ideal Partner Profile** — Detailed description of your perfect collab partner
2. **5 Collab Content Ideas** — Specific content concepts with format and execution plan
3. **Outreach Templates** — 3 professional DM/email templates for reaching out
4. **Collab Formats** — Best collaboration formats for your niche (duets, takeovers, challenges, joint lives)
5. **Partnership Value Proposition** — What you bring to the table and how to present it
6. **Revenue Sharing Models** — Fair compensation structures for different collab types
7. **Red Flags to Avoid** — Warning signs of bad collaboration partners
8. **Cross-Promotion Strategy** — How to maximize mutual benefit
9. **Success Metrics** — How to measure collaboration effectiveness`;
        break;

      case "content_repurposer":
        systemPrompt = "You are a content repurposing expert and multi-platform strategist. You transform single pieces of content into multiple formats optimized for different platforms and audience segments. You understand each platform's unique requirements and best practices.";
        userPrompt = `Repurpose this content into multiple formats:

Original Content: "${params.original_content || "Not provided"}"
Original Format: ${params.original_format || "Text post"}
Target Platforms: ${params.target_platforms || "All major platforms"}
Brand Voice: ${params.brand_voice || "Professional yet approachable"}

Transform into:
1. **Twitter/X Thread** — 5-7 tweet thread with hooks and engagement prompts
2. **Instagram Carousel** — 8-10 slide content with text for each slide
3. **Story Sequence** — 5-6 story frames with interactive elements (polls, questions)
4. **Short-Form Video Script** — 30-60 second Reel/TikTok script with visual directions
5. **LinkedIn Article** — Professional long-form adaptation with key takeaways
6. **Newsletter Snippet** — Email-friendly version with subject line options
7. **Podcast Talking Points** — 5-minute segment outline based on the content
8. **Infographic Blueprint** — Data points and visual layout suggestions
9. **Quote Graphics** — 3-5 shareable quote card texts extracted from content`;
        break;

      case "bot_detector":
        systemPrompt = "You are a social media fraud detection analyst and engagement quality specialist. You analyze follower patterns, engagement metrics, and account behaviors to identify fake followers, bot activity, and inauthentic engagement. You provide actionable cleanup strategies.";
        userPrompt = `Analyze this profile for fake followers and bot activity:

Profile Description: ${params.profile_description || "Not specified"}
Follower Count: ${params.followers || "Not specified"}
Average Likes per Post: ${params.avg_likes || "Not specified"}
Average Comments per Post: ${params.avg_comments || "Not specified"}
Follower Growth Pattern: ${params.growth_pattern || "Not specified"}
Engagement Rate: ${params.engagement_rate || "Not specified"}
Suspicious Activity: ${params.suspicious_signs || "None noted"}

Provide comprehensive analysis:
1. **Authenticity Score** — Rate 1-100 with detailed breakdown
2. **Bot Detection Indicators** — Red flags found in the metrics
3. **Engagement Quality Assessment** — Real vs. fake engagement ratio estimate
4. **Follower Quality Breakdown** — Estimated % of real/inactive/bot followers
5. **Suspicious Patterns** — Timeline anomalies, engagement spikes, follower bursts
6. **Cleanup Recommendations** — Step-by-step guide to remove fake followers
7. **Prevention Strategy** — How to avoid attracting bots in the future
8. **Benchmark Comparison** — How these metrics compare to healthy profiles
9. **Action Plan** — Priority-ordered steps to improve account health
10. **Recovery Timeline** — Expected metrics after cleanup`;
        break;

      case "mood_feed":
        systemPrompt = "You are a mood-based content curator and emotional intelligence specialist. You recommend content themes, topics, and engagement strategies based on the user's current mood and emotional state. You understand the psychology of content consumption and how different moods affect engagement.";
        userPrompt = `Create a personalized content feed strategy based on mood:

Current Mood: ${params.mood || "Neutral"}
Energy Level: ${params.energy_level || "Medium"}
What You Want to Feel: ${params.desired_mood || "Inspired and motivated"}
Content Preferences: ${params.preferences || "Mixed content"}
Time Available: ${params.time_available || "30 minutes"}
Recent Activity: ${params.recent_activity || "Scrolling feed"}

Provide mood-optimized recommendations:
1. **Mood Analysis** — Understanding your current emotional state
2. **Content Prescription** — 10 specific content types/topics optimized for your mood
3. **Engagement Strategy** — How to interact with content to shift your mood positively
4. **Content Creation Mood** — What to post when feeling this way (and what to avoid)
5. **Mood Boosting Posts** — 5 specific post ideas that match your desired emotional state
6. **Timing Advice** — Best times to consume and create content based on mood cycles
7. **Emotional Triggers** — Content topics that will resonate most with your current state
8. **Wellness Check** — Healthy social media habits for your mood
9. **Creative Prompts** — 5 creative post prompts aligned with your emotional energy`;
        break;

      case "voice_post":
        systemPrompt = "You are a voice content strategist and audio branding expert. You help users create compelling voice-based social media content including scripts for voice posts, audio stories, podcast snippets, and voice-over narratives. You understand vocal pacing, emotional delivery, and audio engagement.";
        userPrompt = `Create a voice post script and strategy:

Topic/Message: "${params.topic || "Not provided"}"
Tone: ${params.tone || "Conversational and authentic"}
Target Duration: ${params.duration || "60 seconds"}
Audience: ${params.audience || "General followers"}
Purpose: ${params.purpose || "Engagement and connection"}

Provide:
1. **Voice Post Script** — Complete word-for-word script with [pause], [emphasis], and [tone] markers
2. **Opening Hook** — 3 attention-grabbing opening lines (first 3 seconds are crucial)
3. **Pacing Guide** — Speed, pauses, and rhythm recommendations
4. **Emotional Delivery Notes** — Where to add warmth, excitement, or urgency
5. **Background Music Suggestions** — Mood-appropriate music styles and BPM ranges
6. **Caption/Transcript** — Accessibility text optimized for engagement
7. **Call-to-Action Script** — Compelling spoken CTA for the end
8. **Alternative Versions** — 2 shorter variations (30s and 15s)
9. **Voice Tips** — Practical vocal delivery tips for non-professional speakers
10. **Best Posting Format** — Audio post, voice story, or video with voice-over`;
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
        max_completion_tokens: 3000,
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
