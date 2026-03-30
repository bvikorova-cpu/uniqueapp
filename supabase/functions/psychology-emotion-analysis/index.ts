import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
    if (authError || !user) throw new Error("Not authenticated");

    const { text } = await req.json();
    if (!text || text.length < 20) throw new Error("Text must be at least 20 characters");

    // Check credits
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: credits } = await adminClient
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!credits || credits.credits_remaining < 5) {
      throw new Error("Insufficient credits. You need 5 credits for emotion analysis.");
    }

    // Call AI
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert emotion and sentiment analyst. Analyze the provided text for:
1. Primary and secondary emotions detected (joy, sadness, anger, fear, surprise, disgust, trust, anticipation)
2. Overall sentiment (positive, negative, neutral, mixed)
3. Emotional patterns and underlying psychological themes
4. Practical suggestions for emotional wellbeing

Respond using the suggest_emotions tool.`
          },
          { role: "user", content: text },
        ],
        tools: [{
          type: "function",
          function: {
            name: "suggest_emotions",
            description: "Return structured emotion analysis results",
            parameters: {
              type: "object",
              properties: {
                emotions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      emotion: { type: "string" },
                      score: { type: "number", description: "0.0 to 1.0" },
                    },
                    required: ["emotion", "score"],
                  },
                },
                sentiment: { type: "string", enum: ["positive", "negative", "neutral", "mixed"] },
                analysis: { type: "string", description: "Detailed markdown analysis" },
                suggestions: { type: "string", description: "Markdown suggestions for wellbeing" },
              },
              required: ["emotions", "sentiment", "analysis", "suggestions"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "suggest_emotions" } },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      if (aiResponse.status === 429) throw new Error("Rate limited. Please try again later.");
      if (aiResponse.status === 402) throw new Error("AI credits exhausted. Please add funds.");
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let analysisResult;
    
    if (toolCall?.function?.arguments) {
      analysisResult = JSON.parse(toolCall.function.arguments);
    } else {
      analysisResult = {
        emotions: [{ emotion: "neutral", score: 0.5 }],
        sentiment: "neutral",
        analysis: aiData.choices?.[0]?.message?.content || "Analysis could not be completed.",
        suggestions: "Try journaling your thoughts to better understand your emotions.",
      };
    }

    // Deduct credits
    await adminClient
      .from("ai_credits")
      .update({ credits_remaining: credits.credits_remaining - 5 })
      .eq("user_id", user.id);

    // Save analysis
    await adminClient.from("psychology_emotion_analyses").insert({
      user_id: user.id,
      input_text: text.substring(0, 500),
      analysis_result: analysisResult,
      credits_used: 5,
    });

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: e.message.includes("credits") ? 402 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
