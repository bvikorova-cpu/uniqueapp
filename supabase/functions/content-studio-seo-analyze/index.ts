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

    const { content, targetKeyword } = await req.json();
    if (!content || !targetKeyword) return new Response(JSON.stringify({ error: "Missing content or keyword" }), { status: 400, headers: corsHeaders });

    const creditsNeeded = 4;
    const { data: credits } = await supabase.from("ai_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    if (!credits || credits.credits_remaining < creditsNeeded) {
      return new Response(JSON.stringify({ error: "Insufficient credits" }), { status: 402, headers: corsHeaders });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert SEO analyst. Analyze content for keyword optimization, readability, and provide actionable improvements." },
          { role: "user", content: `Analyze this content for SEO optimization with target keyword "${targetKeyword}".\n\nContent (${content.split(/\s+/).length} words):\n${content.substring(0, 5000)}\n\nProvide: overall score (0-100), title analysis with score, keyword density analysis for the target keyword and related keywords, readability score, 5+ specific improvement suggestions, and a suggested meta description.` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_seo_analysis",
            description: "Return SEO analysis",
            parameters: {
              type: "object",
              properties: {
                overall_score: { type: "number" },
                title_analysis: {
                  type: "object",
                  properties: { score: { type: "number" }, feedback: { type: "string" } },
                  required: ["score", "feedback"]
                },
                keyword_analysis: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      keyword: { type: "string" },
                      density: { type: "number" },
                      occurrences: { type: "number" },
                      recommendation: { type: "string" }
                    },
                    required: ["keyword", "density", "occurrences", "recommendation"]
                  }
                },
                readability: {
                  type: "object",
                  properties: { score: { type: "number" }, feedback: { type: "string" } },
                  required: ["score", "feedback"]
                },
                suggestions: { type: "array", items: { type: "string" } },
                meta_description_suggestion: { type: "string" }
              },
              required: ["overall_score", "title_analysis", "keyword_analysis", "readability", "suggestions", "meta_description_suggestion"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "return_seo_analysis" } },
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
    const analysis = JSON.parse(toolCall?.function?.arguments || "{}");

    await supabase.from("ai_credits").update({ credits_remaining: credits.credits_remaining - creditsNeeded, last_used_at: new Date().toISOString() }).eq("user_id", user.id);
    await supabase.from("ai_usage_history").insert({ user_id: user.id, usage_type: "seo_analysis", credits_used: creditsNeeded, description: `SEO analysis for keyword: ${targetKeyword}` });

    return new Response(JSON.stringify({ analysis, creditsUsed: creditsNeeded }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("SEO analysis error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
  }
});
