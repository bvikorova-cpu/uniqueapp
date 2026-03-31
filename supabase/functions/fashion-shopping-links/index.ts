import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { description, budget, style } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OpenAI API key not configured");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a personal shopping assistant. Generate purchase recommendations with real store names. Return JSON with: outfit_concept, total_estimated_budget (EUR), styling_tip, items array where each has: item_name, brand, estimated_price (EUR), where_to_buy (array of real store names like Zara, H&M, ASOS, Net-a-Porter, Farfetch, etc.), style_match_score (0-100), description, alternatives array (name, price, brand).`
          },
          {
            role: "user",
            content: `Find shopping recommendations:\nLooking for: ${description}\nBudget: €${budget}\nStyle: ${style}\nProvide 4-6 items with alternatives.`
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    const shoppingGuide = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({ shoppingGuide }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
