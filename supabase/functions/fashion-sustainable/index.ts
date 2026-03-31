import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { wardrobe, budget } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("API key not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a sustainable fashion expert helping people transition to eco-friendly wardrobes. You know about ethical brands, sustainable materials, circular fashion, and environmental impact." },
          { role: "user", content: `Provide sustainable fashion recommendations:\n\nCurrent Wardrobe: ${wardrobe}\nBudget: ${budget}\n\nProvide:\n1. sustainabilityScore: Rate current wardrobe sustainability and explain\n2. swapSuggestions: Fast fashion items to replace with sustainable alternatives\n3. ecoAlternatives: Specific sustainable brands and materials recommendations\n4. actionPlan: A 30-day plan to make the wardrobe more sustainable` }
        ],
        tools: [{
          type: "function",
          function: {
            name: "sustainable_result",
            description: "Return sustainable fashion analysis",
            parameters: {
              type: "object",
              properties: {
                sustainabilityScore: { type: "string" },
                swapSuggestions: { type: "string" },
                ecoAlternatives: { type: "string" },
                actionPlan: { type: "string" }
              },
              required: ["sustainabilityScore", "swapSuggestions", "ecoAlternatives", "actionPlan"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "sustainable_result" } }
      })
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const result = toolCall ? JSON.parse(toolCall.function.arguments) : { sustainabilityScore: aiData.choices?.[0]?.message?.content };

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
