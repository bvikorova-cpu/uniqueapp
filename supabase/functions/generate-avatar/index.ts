import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";
import { withRateLimit, RATE_LIMITS } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const STYLE_MODIFIERS: Record<string, string> = {
  realistic: "ultra-photorealistic studio portrait, soft natural lighting, sharp eyes, magazine quality, 85mm lens",
  anime: "vibrant anime portrait, clean line art, expressive eyes, Studio Ghibli inspired, soft cel-shading",
  cyberpunk: "neon cyberpunk portrait, glowing pink-cyan rim lights, futuristic visor reflections, rainy night atmosphere",
  watercolor: "delicate watercolor painting portrait, flowing pastel washes, paper texture, artistic brush strokes",
  pixar: "Pixar / Disney 3D animated character portrait, expressive friendly face, polished render, soft warm lighting",
  oilpainting: "renaissance oil painting portrait, dramatic chiaroscuro lighting, rich textured brushwork, classical composition",
  comic: "bold pop-art comic book portrait, halftone shading, vibrant primary colors, ink outlines",
  fantasy: "epic fantasy portrait, ethereal glowing aura, intricate ornate details, mystical atmosphere",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const __auth = await requireAiCredits(req, corsHeaders, { credits: 5, usageType: "avatar_image" });
    if (__auth.errorResponse) return __auth.errorResponse;
    const __deduct = __auth.deduct!;
    const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.ai_generation, corsHeaders);
    if (rateLimitResponse) return rateLimitResponse;

    const { description, style } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const styleKey = (style || "realistic").toLowerCase();
    const styleHint = STYLE_MODIFIERS[styleKey] || STYLE_MODIFIERS.realistic;

    console.log("Generating avatar:", { style: styleKey, description });

    const prompt = `Professional avatar / profile picture. Subject: ${description}. Style: ${styleHint}. Centered face, clean background, suitable for a social profile. Square 1:1.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate avatar");
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageUrl) throw new Error("No image generated");

    await __deduct().catch((e) => console.error("deduct failed:", e));
    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-avatar function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
