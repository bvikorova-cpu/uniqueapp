import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { celebrity, budget_level } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OpenAI API key not configured");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{
          role: "system",
          content: "You are a celebrity fashion analyst. Break down celebrity looks and find budget alternatives. Return JSON only."
        }, {
          role: "user",
          content: `Break down ${celebrity}'s most iconic recent look and find ${budget_level} budget alternatives. Return JSON: { "celebrity": "", "look_description": "", "style_era": "", "difficulty_to_recreate": "Easy/Medium/Hard", "items": [{"original_item":"","brand":"","estimated_price":"€500","budget_alternative":"","budget_brand":"","budget_price":"€45","match_accuracy":85}], "total_original_cost": "€2,500", "total_budget_cost": "€250", "savings_percentage": 90, "styling_notes": [], "where_to_shop": [] }`
        }],
        temperature: 0.8,
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "AI error");
    const result = JSON.parse(data.choices[0].message.content);
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
