import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageUrl } = await req.json();
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
            content: `You are an expert fashion analyst. Analyze outfit photos and return JSON with: outfit_name, overall_score (0-100), style_category, color_analysis (primary_colors array, harmony_score 0-100, palette_name), identified_items array (item_name, brand_guess, estimated_price in EUR, style_rating 1-10), fit_analysis, occasion_match array, trend_alignment (0-100), improvement_tips array (3-5), celebrity_match, season_suitability.`
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this outfit photo in detail. Identify every item, estimate brands and prices, score the overall look." },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    const scanResult = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({ scanResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
