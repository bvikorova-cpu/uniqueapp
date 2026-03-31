import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { petName, species, level, style, customPrompt } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert AI art director specializing in virtual pet portraits. Generate a vivid, detailed art description that could be used as an image generation prompt. Include: 1) The pet's appearance based on species and level, 2) The chosen art style applied thoroughly, 3) Lighting, composition, and mood, 4) Background elements that complement the pet, 5) Special effects or magical elements based on the pet's level. Make the description 150-250 words, highly visual and evocative." },
          { role: "user", content: `Create a ${style} portrait description for:\nPet: ${petName} (Level ${level} ${species})\n${customPrompt ? `Custom details: ${customPrompt}` : ""}\n\nMake it stunning and detailed.` }
        ],
      }),
    });
    if (!response.ok) throw new Error(`AI error: ${response.status}`);
    const data = await response.json();
    return new Response(JSON.stringify({ result: data.choices?.[0]?.message?.content || "No description generated" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
