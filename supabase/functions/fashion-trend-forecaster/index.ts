import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { season, category } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("API key not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert fashion trend forecaster with deep knowledge of runway shows, street style, and global fashion movements." },
          { role: "user", content: `Forecast fashion trends for ${season} in the ${category} category.\n\nProvide:\n1. topTrends: Top 5-7 emerging trends with descriptions\n2. colorTrends: Trending colors and how to wear them\n3. fabricTrends: Materials and textures gaining popularity\n4. investmentPieces: Key pieces worth investing in this season` }
        ],
        tools: [{
          type: "function",
          function: {
            name: "trend_forecast",
            description: "Return trend forecast",
            parameters: {
              type: "object",
              properties: {
                topTrends: { type: "string" },
                colorTrends: { type: "string" },
                fabricTrends: { type: "string" },
                investmentPieces: { type: "string" }
              },
              required: ["topTrends", "colorTrends", "fabricTrends", "investmentPieces"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "trend_forecast" } }
      })
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const result = toolCall ? JSON.parse(toolCall.function.arguments) : { topTrends: aiData.choices?.[0]?.message?.content || "Forecast complete" };

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
