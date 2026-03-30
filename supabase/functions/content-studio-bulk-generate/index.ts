import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const authHeader = req.headers.get("Authorization");
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader?.replace("Bearer ", ""));
    if (authError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const { topic, guidelines, platform, count } = await req.json();
    if (!topic) return new Response(JSON.stringify({ error: "Missing topic" }), { status: 400, headers: corsHeaders });

    const postCount = Math.min(count || 5, 10);
    const creditsNeeded = postCount * 2;

    const { data: credits } = await supabase.from("ai_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    if (!credits || credits.credits_remaining < creditsNeeded) {
      return new Response(JSON.stringify({ error: "Insufficient credits" }), { status: 402, headers: corsHeaders });
    }

    const platformGuide: Record<string, string> = {
      twitter: "Each post max 280 characters. Engaging, concise, with relevant hashtags.",
      linkedin: "Professional tone, thought-leadership. 200-400 words each. Add emojis sparingly.",
      instagram: "Visual-first descriptions, rich with emojis and 5-10 hashtags each.",
      facebook: "Engaging, conversational. 100-300 words. Include call-to-action.",
      blog: "Blog-style paragraphs, 300-500 words each. SEO-friendly.",
      email: "Email format with subject line and body. Compelling and action-oriented.",
    };

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a social media content expert. Generate unique, engaging posts that each take a different angle on the topic." },
          { role: "user", content: `Generate ${postCount} unique ${platform || "social media"} posts about: ${topic}\n\nPlatform guidelines: ${platformGuide[platform] || "General social media"}\n${guidelines ? `Brand guidelines: ${guidelines}` : ""}\n\nEach post must be unique with a different angle, hook, or perspective.` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_posts",
            description: "Return generated posts",
            parameters: {
              type: "object",
              properties: {
                posts: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "number" },
                      content: { type: "string" },
                      hashtags: { type: "string" }
                    },
                    required: ["id", "content"]
                  }
                }
              },
              required: ["posts"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "return_posts" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: corsHeaders });
      if (status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: corsHeaders });
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const parsed = JSON.parse(toolCall?.function?.arguments || "{}");

    await supabase.from("ai_credits").update({ credits_remaining: credits.credits_remaining - creditsNeeded, last_used_at: new Date().toISOString() }).eq("user_id", user.id);
    await supabase.from("ai_usage_history").insert({ user_id: user.id, usage_type: "bulk_generate", credits_used: creditsNeeded, description: `Bulk: ${postCount} ${platform} posts about ${topic}` });

    return new Response(JSON.stringify({ posts: parsed.posts || [], creditsUsed: creditsNeeded }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Bulk generate error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
  }
});
