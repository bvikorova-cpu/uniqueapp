import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const __auth = await requireAiCredits(req, corsHeaders, { credits: 1, usageType: "wall_assistant" });
    if (__auth.errorResponse) return __auth.errorResponse;
    const __deduct = __auth.deduct!;
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const { type, content, language } = await req.json();
    const lang = language || "sk";

    let systemPrompt = "";
    let userPrompt = "";

    const tools: any[] = [];
    let tool_choice: any = undefined;

    if (type === "hashtags") {
      systemPrompt = `You are a social media hashtag expert. Suggest relevant, trending hashtags for the given post content. Return a mix of popular and niche hashtags. Language: ${lang}.`;
      userPrompt = `Suggest 8-12 relevant hashtags for this post:\n\n"${content}"`;
      tools.push({
        type: "function",
        function: {
          name: "suggest_hashtags",
          description: "Return suggested hashtags for a social media post",
          parameters: {
            type: "object",
            properties: {
              hashtags: {
                type: "array",
                items: { type: "string" },
                description: "List of hashtags without the # symbol"
              }
            },
            required: ["hashtags"],
            additionalProperties: false
          }
        }
      });
      tool_choice = { type: "function", function: { name: "suggest_hashtags" } };

    } else if (type === "caption") {
      systemPrompt = `You are a creative social media copywriter. Generate engaging, authentic captions. Match the tone of the content. Language: ${lang}.`;
      userPrompt = `Write 3 different caption variations for this post idea:\n\n"${content}"\n\nMake them engaging with different tones (casual, professional, fun).`;
      tools.push({
        type: "function",
        function: {
          name: "generate_captions",
          description: "Return caption variations for a social media post",
          parameters: {
            type: "object",
            properties: {
              captions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    text: { type: "string" },
                    tone: { type: "string", enum: ["casual", "professional", "fun"] }
                  },
                  required: ["text", "tone"],
                  additionalProperties: false
                }
              }
            },
            required: ["captions"],
            additionalProperties: false
          }
        }
      });
      tool_choice = { type: "function", function: { name: "generate_captions" } };

    } else if (type === "sentiment") {
      systemPrompt = `You are a sentiment analysis expert. Analyze the emotional tone of social media content. Language: ${lang}.`;
      userPrompt = `Analyze the sentiment and emotional tone of this post:\n\n"${content}"`;
      tools.push({
        type: "function",
        function: {
          name: "analyze_sentiment",
          description: "Analyze sentiment of text",
          parameters: {
            type: "object",
            properties: {
              sentiment: { type: "string", enum: ["positive", "negative", "neutral", "mixed"] },
              score: { type: "number", description: "Sentiment score from -1 to 1" },
              emotions: {
                type: "array",
                items: { type: "string" },
                description: "Detected emotions"
              },
              suggestion: { type: "string", description: "Suggestion to improve engagement" }
            },
            required: ["sentiment", "score", "emotions", "suggestion"],
            additionalProperties: false
          }
        }
      });
      tool_choice = { type: "function", function: { name: "analyze_sentiment" } };

    } else {
      return new Response(JSON.stringify({ error: "Invalid type. Use: hashtags, caption, sentiment" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools,
        tool_choice,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("OpenAI API error:", response.status, text);
      throw new Error("OpenAI API error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const result = JSON.parse(toolCall.function.arguments);

    await __deduct().catch((e) => console.error("deduct failed:", e));
    return new Response(JSON.stringify({ type, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("wall-ai-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
