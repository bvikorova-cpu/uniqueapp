import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Not authenticated");

    const { content } = await req.json();
    if (!content || content.length < 50) throw new Error("Content must be at least 50 characters");

    const CREDIT_COST = 3;

    const { data: credits } = await supabase.from("ai_credits").select("credits_remaining").eq("user_id", user.id).single();
    if (!credits || credits.credits_remaining < CREDIT_COST) {
      return new Response(JSON.stringify({ error: "Insufficient credits. Please purchase more." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a plagiarism and originality checker. Analyze the provided text for:
1. Overall originality score (0-100%)
2. Common phrases, clichés, or generic content that might appear unoriginal
3. Sections that seem templated or widely used
4. Suggestions for making the content more unique

Return your analysis as a JSON object with this exact structure:
{
  "originalityScore": number (0-100),
  "analysis": "detailed analysis string",
  "suggestions": ["suggestion1", "suggestion2", ...],
  "flaggedSections": [{"text": "flagged text excerpt", "reason": "why it was flagged"}, ...]
}

Be thorough but fair. AI-generated content can still be original if it provides unique insights.`
          },
          { role: "user", content: `Analyze this content for originality:\n\n${content}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "plagiarism_report",
            description: "Return plagiarism analysis results",
            parameters: {
              type: "object",
              properties: {
                originalityScore: { type: "number", description: "Originality score 0-100" },
                analysis: { type: "string", description: "Detailed analysis" },
                suggestions: { type: "array", items: { type: "string" } },
                flaggedSections: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      reason: { type: "string" },
                    },
                    required: ["text", "reason"],
                  },
                },
              },
              required: ["originalityScore", "analysis", "suggestions", "flaggedSections"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "plagiarism_report" } },
      }),
    });

    const aiData = await aiResponse.json();
    let result;
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      result = JSON.parse(toolCall.function.arguments);
    } else {
      throw new Error("Failed to analyze content");
    }

    await supabase.from("ai_credits").update({
      credits_remaining: credits.credits_remaining - CREDIT_COST,
      last_used_at: new Date().toISOString(),
    }).eq("user_id", user.id);

    await supabase.from("ai_usage_history").insert({
      user_id: user.id, usage_type: "plagiarism_check", credits_used: CREDIT_COST,
      description: `Plagiarism check - Score: ${result.originalityScore}%`,
    });

    return new Response(JSON.stringify({ result, creditsUsed: CREDIT_COST }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
