import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { image } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OpenAI API key not configured");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{
          role: "system",
          content: "You are an expert textile and fabric analyst. Analyze the fabric in the image. Return JSON only."
        }, {
          role: "user",
          content: [
            { type: "text", text: `Analyze this fabric image. Return JSON: { "fabric_name": "", "composition": [{"material":"","percentage":50}], "quality_score": 85, "breathability": 80, "durability": 75, "comfort": 90, "care_instructions": [{"icon":"🧼","instruction":""}], "best_seasons": [], "styling_tips": [], "sustainability_rating": "Good", "price_tier": "Mid-Range", "similar_alternatives": [{"name":"","pros":"","cons":""}] }` },
            { type: "image_url", image_url: { url: image } }
          ]
        }],
        temperature: 0.7,
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
