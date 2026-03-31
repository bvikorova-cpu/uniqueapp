import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { theme, aesthetic } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("API key not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a creative fashion mood board designer. Generate detailed, evocative mood board descriptions that inspire fashion collections." },
          { role: "user", content: `Create a fashion mood board:\n\nTheme: ${theme}\nAesthetic: ${aesthetic}\n\nProvide:\n1. moodDescription: Overall mood, atmosphere, and visual direction\n2. keyPieces: 8-10 key fashion pieces that define this mood\n3. textures: Fabrics, textures, and materials palette\n4. styling: Hair, makeup, and accessories direction` }
        ],
        tools: [{
          type: "function",
          function: {
            name: "mood_board",
            description: "Return mood board",
            parameters: {
              type: "object",
              properties: {
                moodDescription: { type: "string" },
                keyPieces: { type: "string" },
                textures: { type: "string" },
                styling: { type: "string" }
              },
              required: ["moodDescription", "keyPieces", "textures", "styling"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "mood_board" } }
      })
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const result = toolCall ? JSON.parse(toolCall.function.arguments) : { moodDescription: aiData.choices?.[0]?.message?.content };

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
