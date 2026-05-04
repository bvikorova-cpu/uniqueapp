import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { imageUrl, transformationType, styleApplied } = await req.json();
    if (!imageUrl || !transformationType) {
      return new Response(JSON.stringify({ error: "imageUrl and transformationType required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const auth = await requireAiCredits(req, corsHeaders, {
      credits: 5,
      usageType: `beauty_${transformationType}`,
      description: `${transformationType} - ${styleApplied}`,
    });
    if (auth.errorResponse) return auth.errorResponse;
    const { user, supabase, deduct } = auth;

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("AI service not configured");

    const prompt = transformationType === "hair"
      ? `Photorealistic portrait of a person wearing a ${styleApplied} hairstyle. Studio lighting, magazine quality, high detail.`
      : `Photorealistic portrait of a person wearing ${styleApplied} makeup look. Studio lighting, magazine quality, high detail.`;

    const aiRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        n: 1,
        size: "1024x1024",
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      console.error("OpenAI error:", aiRes.status, txt);
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI request failed: ${txt.slice(0, 200)}`);
    }

    const data = await aiRes.json();
    const b64 = data.data?.[0]?.b64_json;
    const imgUrl = b64 ? `data:image/png;base64,${b64}` : (data.data?.[0]?.url || null);
    if (!imgUrl) throw new Error("No image returned");

    await deduct!();

    await supabase!.from("beauty_transformations").insert({
      user_id: user!.id,
      original_image_url: imageUrl,
      transformed_image_url: imgUrl,
      transformation_type: transformationType,
      style_applied: styleApplied,
      credits_used: 5,
    });

    return new Response(JSON.stringify({ transformedImage: imgUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("beauty-transformation error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
