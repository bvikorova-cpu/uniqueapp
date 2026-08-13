import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";
import { generateOpenAIImage } from "../_shared/unifiedAI.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const clean = (v: unknown, fallback: string) => {
  const s = typeof v === "string" ? v.trim().slice(0, 40) : "";
  return s || fallback;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const __auth = await requireAiCredits(req, corsHeaders, {
      credits: 3,
      usageType: "glamour_doll_render",
      rateLimit: { max: 20, windowSec: 60, bucket: "ai.glamour_doll_render" },
    });
    if (__auth.errorResponse) return __auth.errorResponse;
    const __deduct = __auth.deduct!;

    const body = await req.json().catch(() => ({}));
    const skinTone = clean(body?.skinTone, "light");
    const hairColor = clean(body?.hairColor, "blonde");
    const hairStyle = clean(body?.hairStyle, "Long");
    const dressColor = clean(body?.dressColor, "pink");
    const dressStyle = clean(body?.dressStyle, "Ball Gown");
    const shoeColor = clean(body?.shoeColor, "pink");
    const accessory = clean(body?.accessory, "None");
    const scene = clean(body?.scene, "Studio");

    const SCENES: Record<string, string> = {
      Studio: "seamless pastel pink photography studio backdrop with soft beauty-dish lighting and a subtle floor reflection",
      Runway: "high-fashion runway with bokeh audience lights and dramatic spotlights",
      Ballroom: "opulent ballroom with crystal chandeliers and warm golden light",
      Garden: "sunlit rose garden with dreamy shallow depth of field",
      City: "glossy city street at golden hour with cinematic bokeh",
    };

    const accessoryLine =
      accessory && accessory !== "None"
        ? `Wearing an elegant ${accessory.toLowerCase()} as the only accessory, tastefully styled.`
        : "No extra accessories.";

    const prompt = `Ultra-photorealistic full-body fashion photograph of a beautiful collector fashion doll styled like a real high-fashion model.

Exact appearance (must match precisely):
- ${skinTone} skin tone with realistic subsurface texture, soft pores and natural highlights
- ${hairColor} hair in a ${hairStyle.toLowerCase()} hairstyle, individual glossy strands, natural volume and flyaways
- Wearing a ${dressColor} ${dressStyle.toLowerCase()} with real fabric weave, natural folds, stitching and drape
- ${shoeColor} designer high heels with realistic leather/satin material
- ${accessoryLine}
- Refined symmetrical face, detailed glossy eyes with catchlights, natural eyelashes and eyebrows, subtle glamour makeup

Photography: 85mm portrait lens, f/2.0, full body head-to-toe standing pose, elegant posture, ${SCENES[scene] ?? SCENES.Studio}. Editorial Vogue-quality lighting, true-to-life proportions, crisp fabric and skin detail, soft shadows, high dynamic range, 8k retouched finish.

Absolutely avoid: blocky or low-poly geometry, cylinder or cone shaped limbs, plastic seams, cartoon or CGI look, video-game render, deformed hands, extra limbs, text, watermark, logo.`;

    let img: { b64_json?: string; url?: string } | null = null;
    let lastErr: unknown = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        img = await generateOpenAIImage(prompt, "1024x1536");
        if (img?.b64_json || img?.url) break;
      } catch (e) {
        lastErr = e;
        console.error(`doll render attempt ${attempt + 1} failed`, e);
        await new Promise((r) => setTimeout(r, 700 * (attempt + 1)));
      }
    }

    if (!img?.b64_json && !img?.url) {
      const status = (lastErr as { status?: number } | null)?.status ?? 502;
      return new Response(
        JSON.stringify({ error: "Doll render failed. Please try again in a moment." }),
        { status: status === 429 ? 429 : 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const imageUrl = img.b64_json ? `data:image/png;base64,${img.b64_json}` : img.url!;
    await __deduct().catch((e) => console.error("deduct failed:", e));

    return new Response(JSON.stringify({ imageUrl, creditsUsed: 3 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("glamour-doll-render error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Render failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
