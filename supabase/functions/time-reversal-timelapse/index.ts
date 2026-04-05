import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { imageUrl, startAge, endAge, frames } = await req.json();
    if (!imageUrl) throw new Error("Image URL required");

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OpenAI API key not configured");

    const numFrames = frames || 8;
    const ageStep = ((endAge || 80) - (startAge || 20)) / (numFrames - 1);
    const generatedFrames = [];

    // Generate description for each age frame
    for (let i = 0; i < Math.min(numFrames, 4); i++) {
      const age = Math.round((startAge || 20) + ageStep * i * (numFrames / 4));
      
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: `Portrait photo of a person at age ${age}. Professional headshot, neutral background, natural aging progression. Photorealistic.`,
          n: 1,
          size: "1024x1024",
        }),
      });

      const data = await res.json();
      if (data.data?.[0]?.url) {
        generatedFrames.push({ age, url: data.data[0].url });
      }
    }

    return new Response(JSON.stringify({
      frames: generatedFrames,
      startAge: startAge || 20,
      endAge: endAge || 80,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
