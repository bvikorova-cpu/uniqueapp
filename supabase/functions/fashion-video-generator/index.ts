import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { concept, style, duration, mood } = await req.json();
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
            content: `You are a cinematic fashion video director. Create detailed scene-by-scene storyboards for fashion show videos. Return JSON with: overall_concept, recommended_soundtrack, color_grading, total_duration, production_notes, and storyboard array where each scene has: scene_number, scene_title, visual_description, camera_movement, lighting, music_mood, duration_seconds, transition.`
          },
          {
            role: "user",
            content: `Create a ${duration}-second ${style} fashion show video storyboard.\nConcept: ${concept}\nMood: ${mood || "Sophisticated"}\nGenerate 6-10 detailed scenes.`
          }
        ],
        temperature: 0.8,
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    const videoStoryboard = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({ videoStoryboard }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
