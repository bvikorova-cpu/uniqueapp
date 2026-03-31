import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { baseColor, occasion, skinTone } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("API key not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert color consultant specializing in fashion and personal styling. You understand color theory, seasonal color analysis, and how colors interact with different skin tones." },
          { role: "user", content: `Create a color harmony analysis:\n\nBase Color: ${baseColor}\nOccasion: ${occasion}\nSkin Tone: ${skinTone}\n\nProvide:\n1. harmonicPalette: 5-7 harmonious colors that work with the base color\n2. outfitCombinations: 3-4 complete outfit color combinations\n3. avoidColors: Colors that clash or don't work\n4. seasonalAdaptation: How to adapt this palette across seasons` }
        ],
        tools: [{
          type: "function",
          function: {
            name: "color_harmony",
            description: "Return color harmony analysis",
            parameters: {
              type: "object",
              properties: {
                harmonicPalette: { type: "string" },
                outfitCombinations: { type: "string" },
                avoidColors: { type: "string" },
                seasonalAdaptation: { type: "string" }
              },
              required: ["harmonicPalette", "outfitCombinations", "avoidColors", "seasonalAdaptation"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "color_harmony" } }
      })
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const result = toolCall ? JSON.parse(toolCall.function.arguments) : { harmonicPalette: aiData.choices?.[0]?.message?.content };

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
