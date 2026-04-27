import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getSystemPrompt(action: string): string {
  const prompts: Record<string, string> = {
    "content-calendar": "You are a social media content strategist. Generate a detailed content calendar. Return JSON array with objects: { day, title, description, type (Post/Reel/Story/Video), hashtags }.",
    "brand-deals": "You are a brand partnership matchmaker. Generate realistic brand deal opportunities. Return JSON array with objects: { brand, description, payout (e.g. '$500-$2000'), type (Sponsored Post/Story/Campaign/Ambassador), match_score }.",
    "trend-analysis": "You are a social media trend analyst. Analyze current trends. Return JSON with: { trending_topics: string[], hashtags: string[], recommendations: string[] }.",
    "battle": "You are a content battle judge. Compare two influencers. Return JSON with: { winner, summary, player1_stats: { creativity, engagement, consistency, virality, brand_appeal }, player2_stats: same, rounds: [{ category, result }] }.",
    "caption": "You are a viral caption writer. Write 5 engaging captions for the described content. Return as plain text, numbered.",
    "hashtags": "You are a hashtag researcher. Generate 30 optimized hashtags grouped by reach. Return as plain text with sections: High Reach, Medium Reach, Niche.",
    "content-ideas": "You are a content ideation expert. Generate 10 viral content ideas. Return as plain text, numbered with format and platform suggestions.",
    "audience-insight": "You are an audience analyst. Provide detailed audience demographics and behavior insights. Return as plain text with sections.",
    "engagement-boost": "You are an engagement optimization expert. Provide 10 actionable strategies to boost engagement. Return as plain text, numbered.",
    "competitor-spy": "You are a competitive intelligence analyst. Analyze the described competitors. Return as plain text with strategies, strengths, and weaknesses.",
    "reply-gen": "You are a social media manager. Generate 5 on-brand reply options for the given comment/DM. Return as plain text, numbered.",
    "script-writer": "You are a video scriptwriter. Write an engaging script with hook, body, and CTA. Return as plain text with timestamps.",
    "brand-voice": "You are a brand strategist. Define a comprehensive brand voice guide. Return as plain text with tone, vocabulary, do's and don'ts.",
    "media-kit": "You are a media kit designer. Generate a professional media kit text layout. Return as plain text with sections: About, Stats, Services, Rates, Past Collaborations.",
    "crisis-manager": "You are a PR crisis manager. Analyze the situation and provide a response strategy. Return as plain text with Assessment, Response Draft, and Next Steps.",
    "collab-finder": "You are a collaboration matchmaker. Suggest 5 ideal collaboration partners. Return as plain text with Name, Why They Match, Collaboration Idea.",
  };
  return prompts[action] || "You are a helpful social media AI assistant. Provide detailed, actionable advice.";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Not authenticated");

    // Check credits
    const { data: credits } = await supabase.from("ai_credits").select("*").eq("user_id", user.id).maybeSingle();
    if (!credits || credits.credits_remaining < 3) {
      return new Response(JSON.stringify({ error: "Insufficient credits. Please purchase more credits." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;
    const systemPrompt = getSystemPrompt(action);

    let userMessage = "";
    switch (action) {
      case "content-calendar":
        userMessage = `Create a ${body.days}-day content calendar for the ${body.niche} niche.`;
        break;
      case "brand-deals":
        userMessage = `Find brand deal opportunities for a ${body.niche} influencer with ${body.followers} followers.`;
        break;
      case "trend-analysis":
        userMessage = `Analyze current trends on ${body.platform} for the ${body.niche} niche.`;
        break;
      case "battle":
        userMessage = `Battle between "${body.player1}" and "${body.player2}". Judge them on content quality, creativity, engagement potential, consistency, and virality.`;
        break;
      default:
        userMessage = body.input || "Provide general social media advice.";
    }

    const creditsUsed = ["brand-deals", "trend-analysis", "battle", "audience-insight", "competitor-spy", "script-writer", "brand-voice", "media-kit", "crisis-manager", "collab-finder", "content-calendar"].includes(action) ? 5 : 3;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_completion_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", errText);
      throw new Error("AI generation failed");
    }

    const aiData = await response.json();
    const text = aiData.choices[0]?.message?.content || "";

    // Deduct credits
    await supabase.from("ai_credits").update({ credits_remaining: credits.credits_remaining - creditsUsed }).eq("user_id", user.id);

    // Try to parse JSON responses
    let result: any = { result: text };
    if (["content-calendar", "brand-deals", "trend-analysis", "battle"].includes(action)) {
      try {
        const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\[[\s\S]*\])/) || text.match(/(\{[\s\S]*\})/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          if (action === "content-calendar") result = { calendar: Array.isArray(parsed) ? parsed : parsed.calendar || [] };
          else if (action === "brand-deals") result = { deals: Array.isArray(parsed) ? parsed : parsed.deals || [] };
          else result = parsed;
        }
      } catch { /* keep text result */ }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error:", error);
    const status = error.message?.includes("Insufficient") ? 402 : error.message?.includes("authenticated") ? 401 : 500;
    return new Response(JSON.stringify({ error: error.message }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
