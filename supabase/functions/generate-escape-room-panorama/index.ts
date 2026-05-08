// Generate a panoramic escape room scene using OpenAI gpt-image-1.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { roomName, theme, description } = await req.json();
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

    const prompt = `Ultra-wide cinematic 360° equirectangular panorama of an immersive escape room scene. Room: "${roomName || "Mystery Room"}". Theme: ${theme || "mystery"}. ${description || ""}. Highly detailed, atmospheric lighting, volumetric fog, dramatic shadows, photo-realistic textures, no people, no text, no watermarks.`;

    const resp = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size: "1792x1024",
        n: 1,
      }),
    });

    if (!resp.ok) {
      const status = resp.status;
      const errText = await resp.text();
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error(`OpenAI image error ${status}: ${errText}`);
    }

    const data = await resp.json();
    const b64: string | undefined = data?.data?.[0]?.b64_json;
    const url: string | undefined = data?.data?.[0]?.url;
    const imageUrl = url ?? (b64 ? `data:image/png;base64,${b64}` : undefined);
    if (!imageUrl) throw new Error("No image returned");

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[generate-escape-room-panorama]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
