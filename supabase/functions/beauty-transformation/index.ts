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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("AI gateway not configured");

    const prompt = transformationType === "hair"
      ? `Apply a ${styleApplied} hairstyle to this person while keeping their face identical. Photorealistic, high detail.`
      : `Apply ${styleApplied} makeup look to this person while keeping their facial features identical. Photorealistic.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        }],
        modalities: ["image", "text"],
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, txt);
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted on the platform. Please contact support." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI request failed: ${txt.slice(0, 200)}`);
    }

    const data = await aiRes.json();
    const imgB64 = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imgB64) {
      console.error("No image in response:", JSON.stringify(data).slice(0, 500));
      throw new Error("No image returned");
    }

    await deduct!();

    await supabase!.from("beauty_transformations").insert({
      user_id: user!.id,
      original_image_url: imageUrl,
      transformed_image_url: imgB64,
      transformation_type: transformationType,
      style_applied: styleApplied,
      credits_used: 5,
    });

    return new Response(JSON.stringify({ transformedImage: imgB64 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("beauty-transformation error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
