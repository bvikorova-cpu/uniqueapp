import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";
import { tryVertexImage } from "../_shared/vertexDirect.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

import { STYLE_PROMPTS } from "../_shared/photoStylePrompts.ts";



const BASE_RULES =
  "Restyle the EXACT person in the supplied photo. Only the rendering medium/art style may change — " +
  "everything else must stay faithful to the source photo.\n" +
  "Copy exactly, do not reinterpret or beautify: face identity and proportions, EYE COLOR, eyebrow and " +
  "hair colour, hairstyle and hair length, skin tone, makeup, pose, head tilt, hand placement, camera " +
  "angle and crop.\n" +
  "Clothing must be reproduced exactly as worn in the photo: same garment type, same colour, same neckline, " +
  "same sleeve length (if the photo shows bare shoulders or straps, keep them bare — never add sleeves, " +
  "jackets or extra layers), same visible jewellery.\n" +
  "Keep every object and background element that is visible in the photo (glasses, cups, table, props) in " +
  "the same position; do not add or remove objects.\n" +
  "Do not change the person's age, body shape or expression. Fully clothed, tasteful, no nudity, no sexual " +
  "content. Output only the finished artwork image.";

const OUTFIT_RULES =
  "Restyle the EXACT person in the supplied photo. The art style, the OUTFIT and the scene may change to " +
  "match the chosen theme.\n" +
  "Copy exactly, do not reinterpret or beautify: face identity and proportions, EYE COLOR, eyebrow and " +
  "hair colour, skin tone, age, body shape and expression. Keep the pose and camera angle close to the source.\n" +
  "Replace the clothing with a complete, well-fitted themed costume that matches the requested style, " +
  "including matching accessories, hair styling and background. The costume must always be fully covering " +
  "and tasteful.\n" +
  "Do not change the person's age or body shape. No nudity, no lingerie, no sexual or suggestive content. " +
  "Output only the finished artwork image.";

const REALISM_RULES =
  "\n\nRENDERING MODE — PHOTOREALISTIC: the final image must look like a real photograph taken with a " +
  "professional camera (full-frame DSLR, 50-85mm lens, shallow depth of field), NOT a drawing, painting, " +
  "cartoon, anime, 3D render or digital illustration. Real human skin with pores, fine hair strands, " +
  "realistic fabric weave and stitching, physically correct lighting, shadows and reflections, natural " +
  "colour grading, subtle photographic grain. Absolutely no illustration outlines, no painterly brush " +
  "strokes, no stylised eyes, no smoothed plastic skin. Treat the chosen style only as wardrobe, scene, " +
  "props and lighting direction — realise it as a real-world photo shoot. Costumes must be real, " +
  "tailored garments made of actual fabric, leather, metal or beadwork with visible seams, texture and " +
  "wear — professional cosplay/editorial photography, never a CGI character or a digital painting. " +
  "Backgrounds must be real locations or real built sets with true perspective and natural light.";

// Portrait / headshot styles must be an actual face portrait, not a full-body shot.
const PORTRAIT_RE = /(portrait|headshot|head.?shot|beauty close.?up|close.?up|magazine cover|makeup|hairstyle|face)/i;

const PORTRAIT_RULES =
  "\n\nFRAMING — FACE PORTRAIT: tight head-and-shoulders composition (85mm portrait lens look). The face " +
  "fills most of the frame, eyes on the upper third, sharp focus on the eyes with visible catchlights, " +
  "skin texture and individual hair strands clearly rendered, softly blurred background. Do NOT produce a " +
  "full-body, three-quarter or wide standing shot — crop at the chest or shoulders.";

// Styles whose whole point is a non-photographic medium — these keep their look.
const ART_MEDIUM_RE =
  /(painting|painterly|illustration|illustrated|cartoon|anime|manga|comic|sketch|drawing|drawn|watercolou?r|oil paint|pastel drawing|charcoal|ink|3d render|render|cgi|pixel|voxel|low.?poly|clay|claymation|vector|graffiti|mural|woodcut|lino|engraving|mosaic|stained.glass|origami|papercut|storybook|fresco|caricature|doodle|sticker|emoji|tattoo|poster art|art nouveau|art deco style|impressionis|cubis|surrealis|pop art|ukiyo|animation|pixar|disney.style|toon)/i;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const image = String(body?.image ?? "");
    const styles: string[] = Array.isArray(body?.styles) ? body.styles.slice(0, 4).map(String) : [];
    const customPrompt = String(body?.customPrompt ?? "").slice(0, 300);
    const changeOutfit = body?.changeOutfit === true;
    const photoreal = body?.photoreal === true;
    const aspect = body?.aspect === "9:16" || body?.aspect === "16:9" ? body.aspect : "1:1";

    if (!image.startsWith("data:image/") && !/^https?:\/\//.test(image)) {
      return json({ error: "A photo is required." }, 400);
    }
    if (!styles.length) return json({ error: "Pick at least one style." }, 400);

    const cost = 3 * styles.length;
    // Charged per rendered style (3 credits each), so the unit auth is 3.
    const auth = await requireAiCredits(req, corsHeaders, {
      credits: 3,
      usageType: "photo_styler",
      description: `Photo styler: ${styles.join(", ")}`,
      rateLimit: { bucket: "photo_styler", max: 12, windowSec: 60 },
    });
    if (auth.errorResponse) return auth.errorResponse;
    if ((auth.credits ?? 0) < cost) {
      return json(
        { error: `Insufficient AI credits. Need ${cost}, have ${auth.credits ?? 0}.`, creditsRequired: cost },
        402,
      );
    }

    const results: { style: string; image?: string; error?: string }[] = [];
    for (const style of styles) {
      const stylePrompt = STYLE_PROMPTS[style];
      if (!stylePrompt) {
        results.push({ style, error: "Unknown style" });
        continue;
      }
      const kidsBoost = style.startsWith("kid")
        ? photoreal
          ? " Photorealistic children's lifestyle scene: real kids and real fluffy animals, vivid candy colours as real props and clothing, natural confetti/glitter caught in real light, bright cheerful daylight, shallow depth of field, professional lifestyle photography. No cartoon outlines, no illustration, no 3D render, no storybook painting."
          : " Ultra vivid, joyful children's-storybook look: highly saturated candy colours (hot pink, turquoise, sunny yellow, lime), sparkles, confetti, glitter and rainbow light, cute fluffy animal friends nearby (kittens, puppies, bunnies) with big shiny eyes, soft round shapes, bright cheerful daylight, playful and magical, absolutely nothing dark or dull."
        : "";
      // Styles that are explicitly an art medium keep their look; everything
      // else (costumes, professions, buildings, emotions, places, motivation…)
      // is rendered as a real photograph instead of a CGI/illustration look.
      const isArtMedium = ART_MEDIUM_RE.test(stylePrompt);
      const autoReal = !isArtMedium && !style.startsWith("kid") ? REALISM_RULES : "";
      const prompt = `${changeOutfit ? OUTFIT_RULES : BASE_RULES}\n\nStyle: ${stylePrompt}.${kidsBoost}${
        customPrompt ? ` Extra direction: ${customPrompt}.` : ""
      }\n\nReminder: ${
        changeOutfit
          ? "the face identity, eye colour, hair colour and skin tone stay identical to the source photo; the outfit, accessories and background follow the chosen theme."
          : "the style affects only technique, texture and lighting treatment — the eye colour, hair colour, clothing (including sleeve length and neckline) and props stay identical to the source photo."
      }${photoreal ? REALISM_RULES : autoReal}${
        PORTRAIT_RE.test(stylePrompt) || PORTRAIT_RE.test(style) ? PORTRAIT_RULES : ""
      }`;
      try {
        const out = await tryVertexImage(prompt, aspect, 1, [image]);
        const b64 = out?.data?.[0]?.b64_json;
        if (b64) results.push({ style, image: `data:image/png;base64,${b64}` });
        else results.push({ style, error: "The image model returned nothing. Try again." });
      } catch (e) {
        console.error(`[photo-styler] style ${style} failed:`, e instanceof Error ? e.message : e);
        results.push({ style, error: e instanceof Error ? e.message : "Generation failed" });
      }
    }

    const ok = results.filter((r) => r.image).length;
    if (!ok) {
      return json({ error: "Image model unavailable right now. No credits were used.", results }, 503);
    }

    // Charge only for the styles that actually rendered.
    for (let i = 0; i < ok; i++) {
      await auth.deduct!().catch((e) => console.error("[photo-styler] deduct failed:", e));
    }

    return json({ results, creditsSpent: ok * 3 });
  } catch (e) {
    console.error("[photo-styler] error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
