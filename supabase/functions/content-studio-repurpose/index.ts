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
    const token = authHeader?.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const { sourceContent, formats } = await req.json();
    if (!sourceContent || !formats?.length) return new Response(JSON.stringify({ error: "Missing content or formats" }), { status: 400, headers: corsHeaders });

    const creditsNeeded = formats.length * 3;

    const { data: credits } = await supabase.from("ai_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    if (!credits || credits.credits_remaining < creditsNeeded) {
      return new Response(JSON.stringify({ error: "Insufficient credits" }), { status: 402, headers: corsHeaders });
    }

    const formatDescriptions: Record<string, string> = {
      twitter_thread: "A Twitter/X thread (3-6 tweets, each under 280 characters, numbered)",
      linkedin_post: "A professional LinkedIn post with thought-leadership tone",
      instagram_caption: "An Instagram caption with emojis and relevant hashtags",
      email_newsletter: "An email newsletter with subject line and engaging body",
      blog_summary: "A concise blog summary with 3-5 key takeaways",
      sms_marketing: "An ultra-short SMS marketing message under 160 characters",
    };

    const formatList = formats.map((f: string) => `"${f}": ${formatDescriptions[f] || f}`).join("\n");

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a content repurposing expert. Transform the given content into the requested formats. Return valid JSON only." },
          { role: "user", content: `Transform this content into the following formats. Return a JSON object with format IDs as keys and the repurposed content as string values.\n\nFormats:\n${formatList}\n\nSource content:\n${sourceContent}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_repurposed",
            description: "Return repurposed content",
            parameters: {
              type: "object",
              properties: {
                results: { type: "object", additionalProperties: { type: "string" } }
              },
              required: ["results"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "return_repurposed" } },
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
    const results = JSON.parse(toolCall?.function?.arguments || "{}").results || {};

    await supabase.from("ai_credits").update({ credits_remaining: credits.credits_remaining - creditsNeeded, last_used_at: new Date().toISOString() }).eq("user_id", user.id);
    await supabase.from("ai_usage_history").insert({ user_id: user.id, usage_type: "content_repurpose", credits_used: creditsNeeded, description: `Repurposed into ${formats.length} formats` });

    return new Response(JSON.stringify({ results, creditsUsed: creditsNeeded }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Repurpose error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
  }
});
