import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { weight, height, body_fat_percent, activity_level, daily_calories, timeframe_days } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a body composition expert. Return JSON only with: predicted_weight (number), weight_change (number, negative=loss), predicted_body_fat (number), fat_change (number), muscle_mass (number), recommendations (array of strings), milestones (array of {day, description})." },
          { role: "user", content: `Predict body composition changes. Current weight: ${weight}kg, Height: ${height}cm, Body fat: ${body_fat_percent}%, Activity: ${activity_level}, Daily calories: ${daily_calories}, Timeframe: ${timeframe_days} days` }
        ],
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    const prediction = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({ prediction }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
