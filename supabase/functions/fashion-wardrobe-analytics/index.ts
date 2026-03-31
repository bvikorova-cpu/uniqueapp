import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { items } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OpenAI API key not configured");

    const itemsSummary = (items || []).map((i: any) => `${i.name || i.title || "Item"} (${i.category || "uncategorized"}, ${i.color || "unknown color"})`).join(", ");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a wardrobe analytics expert. Analyze wardrobe data and return JSON with: wardrobe_score (0-100), sustainability_rating, wardrobe_summary (total_items, total_estimated_value EUR, avg_cost_per_wear EUR, most_worn_category, least_worn_category), category_breakdown array (category, count, percentage, value EUR), color_distribution array (color, count, percentage), usage_insights (most_versatile_item, underused_items array, cost_per_wear_champions array with item, cost_per_wear, times_worn), recommendations array (5 actionable tips).`
          },
          {
            role: "user",
            content: `Analyze this wardrobe of ${items?.length || 0} items: ${itemsSummary || "No items provided - generate sample analysis"}`
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    const analytics = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({ analytics }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
