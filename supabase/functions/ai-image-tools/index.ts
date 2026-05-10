import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TOOL_COSTS: Record<string, number> = {
  generate: 5,
  edit: 3,
  style_transfer: 3,
  upscale: 2,
  prompt_gallery: 0,
  variations: 2,
  inpainting: 4,
  image_to_prompt: 3,
  // NEW
  outpainting: 4,
  bg_remove: 2,
  bg_replace: 3,
  reference_image: 4,
  logo_text: 4,
  sketch_to_image: 4,
  character_consistency: 5,
  face_swap: 4,
  pose_control: 4,
  tile_pattern: 3,
  avatar_pack: 8,
  animate_image: 6,
  prompt_enhance: 1,
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const OPENAI_IMAGE_URL = "https://api.openai.com/v1/images/generations";
const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";

// Map aspectRatio + size tier to OpenAI-supported size
const resolveSize = (aspectRatio?: string, targetSize?: string) => {
  const valid = ["1024x1024", "1792x1024", "1024x1792"];
  if (targetSize && valid.includes(targetSize)) return targetSize;
  switch (aspectRatio) {
    case "16:9":
    case "21:9":
    case "3:2":
    case "4:3":
      return "1792x1024";
    case "9:16":
    case "2:3":
    case "3:4":
    case "4:5":
      return "1024x1792";
    case "1:1":
    default:
      return "1024x1024";
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing Authorization header" }, 401);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return json({ error: "Not authenticated" }, 401);

    const body = await req.json().catch(() => ({}));
    const {
      action, prompt, imageUrl, style, targetSize, editPrompt, region, variationIndex,
      // NEW params
      aspectRatio, negativePrompt, seed, referenceImageUrl, referencePrompt,
      backgroundPrompt, logoText, brandName, sketchDescription, characterName,
      characterDescription, pose, patternType, count,
    } = body ?? {};

    if (!action || typeof action !== "string") return json({ error: "Missing action" }, 400);
    if (!(action in TOOL_COSTS)) return json({ error: `Unknown action: ${action}` }, 400);

    const cost = TOOL_COSTS[action] || 0;

    let creditsBefore = 0;
    if (cost > 0) {
      const { data: credits } = await supabase
        .from("ai_credits")
        .select("credits_remaining")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!credits || credits.credits_remaining < cost) {
        return json({ error: `Insufficient credits. Need ${cost} credits.` }, 402);
      }
      creditsBefore = credits.credits_remaining;
      const { error: deductErr } = await supabase
        .from("ai_credits")
        .update({ credits_remaining: creditsBefore - cost, last_used_at: new Date().toISOString() })
        .eq("user_id", user.id);
      if (deductErr) return json({ error: "Failed to reserve credits" }, 500);
    }

    const refund = async () => {
      if (cost > 0) {
        await supabase
          .from("ai_credits")
          .update({ credits_remaining: creditsBefore })
          .eq("user_id", user.id);
      }
    };

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      await refund();
      return json({ error: "OPENAI_API_KEY is not configured" }, 500);
    }

    const generateImage = async (p: string, size = "1024x1024") => {
      // Append negative prompt as natural-language exclusion if provided
      const finalPrompt = negativePrompt && typeof negativePrompt === "string" && negativePrompt.trim()
        ? `${p}\n\nDo NOT include: ${negativePrompt.trim()}.`
        : p;
      const res = await fetch(OPENAI_IMAGE_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt: finalPrompt,
          n: 1,
          size,
          quality: "high",
          output_format: "webp",
          output_compression: 90,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("OpenAI image API error:", res.status, text);
        throw new Error(`Image generation failed (${res.status})`);
      }
      const data = await res.json();
      const b64 = data?.data?.[0]?.b64_json;
      if (!b64) throw new Error("No image returned by OpenAI");
      return `data:image/webp;base64,${b64}`;
    };

    const chatJSON = async (messages: any[]) => {
      const res = await fetch(OPENAI_CHAT_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-4o-mini", messages, response_format: { type: "json_object" } }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("OpenAI chat API error:", res.status, text);
        throw new Error(`AI request failed (${res.status})`);
      }
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty AI response");
      return JSON.parse(content);
    };

    const size = resolveSize(aspectRatio, targetSize);
    const seedHint = seed ? ` (seed: ${seed})` : "";

    let result: any = {};
    try {
      switch (action) {
        case "generate": {
          if (!prompt?.trim()) throw new Error("Prompt is required");
          result = { imageUrl: await generateImage(prompt + seedHint, size), seed: seed ?? null };
          break;
        }
        case "edit": {
          if (!prompt?.trim()) throw new Error("Prompt is required");
          result = { imageUrl: await generateImage(`${prompt}. Based on the original image concept, create an edited version.`, size) };
          break;
        }
        case "style_transfer": {
          if (!prompt?.trim() || !style) throw new Error("Prompt and style required");
          result = { imageUrl: await generateImage(`Recreate this concept in the style of ${style}: ${prompt}. Make it a masterful artistic interpretation.`, size) };
          break;
        }
        case "upscale": {
          if (!prompt?.trim()) throw new Error("Prompt is required");
          result = { imageUrl: await generateImage(`Create a highly detailed, ultra high resolution, sharp, crystal clear version of: ${prompt}. Maximum detail, 4K quality, enhanced textures and lighting.`, size) };
          break;
        }
        case "variations": {
          if (!prompt?.trim()) throw new Error("Prompt is required");
          const variationStyles = [
            "photorealistic with dramatic lighting",
            "in a painterly impressionist style with bold brushstrokes",
            "as a stylized digital illustration with vibrant colors",
            "in a moody cinematic style with film grain and shallow depth of field",
          ];
          const idx = Number.isInteger(variationIndex) ? variationIndex : 0;
          result = { imageUrl: await generateImage(`${prompt}, rendered ${variationStyles[idx % variationStyles.length]}`, size) };
          break;
        }
        case "inpainting": {
          if (!prompt?.trim() || !editPrompt?.trim()) throw new Error("Prompt and editPrompt required");
          result = { imageUrl: await generateImage(`Create an image of: ${prompt}. However, specifically for the ${region || "selected"} area: ${editPrompt}. The rest of the image should remain consistent with the original concept.`, size) };
          break;
        }
        case "outpainting": {
          if (!prompt?.trim()) throw new Error("Prompt is required");
          const dir = region || "all sides";
          result = { imageUrl: await generateImage(`Wide-format extended scene of: ${prompt}. Naturally expand the composition to ${dir}, seamlessly continuing the environment, lighting, perspective and color palette. Cinematic widescreen.`, size) };
          break;
        }
        case "bg_remove": {
          if (!prompt?.trim()) throw new Error("Subject description required");
          result = { imageUrl: await generateImage(`Studio product shot of: ${prompt}. Pure solid white background, no shadows, perfectly isolated subject, clean cutout look, professional e-commerce photography.`, size) };
          break;
        }
        case "bg_replace": {
          if (!prompt?.trim() || !backgroundPrompt?.trim()) throw new Error("Subject and backgroundPrompt required");
          result = { imageUrl: await generateImage(`Image of: ${prompt}, but with the background completely replaced by: ${backgroundPrompt}. Subject perfectly integrated with realistic lighting, shadows, and color grading matching the new environment.`, size) };
          break;
        }
        case "reference_image": {
          if (!referencePrompt?.trim() || !prompt?.trim()) throw new Error("Reference description and new prompt required");
          result = { imageUrl: await generateImage(`Generate a new image inspired by a reference described as: "${referencePrompt}". The new scene should be: ${prompt}. Match the visual style, color palette, mood, lighting and composition of the reference.`, size) };
          break;
        }
        case "logo_text": {
          if (!logoText?.trim()) throw new Error("Logo text required");
          const brand = brandName ? ` for the brand "${brandName}"` : "";
          result = { imageUrl: await generateImage(`Professional logo design${brand} featuring the exact text "${logoText}" rendered with crisp, perfectly legible typography. ${prompt || "Clean modern aesthetic"}. Vector-style, balanced composition, brand-ready.`, size) };
          break;
        }
        case "sketch_to_image": {
          if (!sketchDescription?.trim() || !prompt?.trim()) throw new Error("Sketch description and target style required");
          result = { imageUrl: await generateImage(`Take this rough sketch concept: "${sketchDescription}". Transform it into a polished, fully rendered image: ${prompt}. Preserve composition and proportions of the sketch.`, size) };
          break;
        }
        case "character_consistency": {
          if (!characterName?.trim() || !characterDescription?.trim() || !prompt?.trim()) throw new Error("Character name, description, scene required");
          result = { imageUrl: await generateImage(`Character named "${characterName}" with these defining features: ${characterDescription}. Always render this character with the EXACT same face, hair, body type, clothing style and color palette across scenes. Current scene: ${prompt}.`, size) };
          break;
        }
        case "face_swap": {
          if (!prompt?.trim()) throw new Error("Scene prompt required");
          result = { imageUrl: await generateImage(`Portrait composition: ${prompt}. ${referencePrompt ? `Replace the face with someone matching: ${referencePrompt}.` : ""} Photo-realistic skin, natural lighting, seamless blend.`, size) };
          break;
        }
        case "pose_control": {
          if (!prompt?.trim() || !pose?.trim()) throw new Error("Prompt and pose required");
          result = { imageUrl: await generateImage(`${prompt}. The subject must be in this exact pose: ${pose}. Anatomically correct, natural proportions.`, size) };
          break;
        }
        case "tile_pattern": {
          if (!prompt?.trim()) throw new Error("Pattern description required");
          const type = patternType || "seamless tile";
          result = { imageUrl: await generateImage(`A ${type} pattern of: ${prompt}. Perfectly seamless, edges that tile infinitely without visible seams, high-detail repeating texture.`, "1024x1024") };
          break;
        }
        case "avatar_pack": {
          if (!prompt?.trim()) throw new Error("Person description required");
          const n = Math.min(Math.max(Number(count) || 4, 1), 4);
          const styles = [
            "professional corporate headshot, neutral background",
            "casual lifestyle portrait, soft natural lighting",
            "creative artistic portrait, vivid color grading",
            "cinematic moody portrait, dramatic shadows",
          ];
          const urls: string[] = [];
          for (let i = 0; i < n; i++) {
            urls.push(await generateImage(`${prompt}. ${styles[i % styles.length]}. High-end professional avatar, perfect facial symmetry, consistent identity across the pack.`, "1024x1024"));
          }
          result = { imageUrls: urls };
          break;
        }
        case "animate_image": {
          if (!prompt?.trim()) throw new Error("Animation description required");
          // Render a stylized motion-blur frame as preview; true video is out of scope here.
          result = {
            imageUrl: await generateImage(`A single keyframe representing the START of an animation: ${prompt}. Add subtle motion-blur and dynamic energy hinting at movement.`, size),
            note: "Static keyframe preview. Full video animation coming soon.",
          };
          break;
        }
        case "prompt_enhance": {
          if (!prompt?.trim()) throw new Error("Prompt required");
          const out = await chatJSON([
            { role: "system", content: "You enhance short image prompts into rich, detailed prompts for AI image generators. Return JSON: { enhanced: string (40-80 words, vivid, with style/lighting/composition/quality keywords), tips: string[] (3 short tips) }." },
            { role: "user", content: `Enhance this prompt: "${prompt}"` },
          ]);
          result = out;
          break;
        }
        case "image_to_prompt": {
          if (!imageUrl) throw new Error("imageUrl is required");
          result = await chatJSON([
            { role: "system", content: "You analyze images and generate detailed prompts that could recreate them. Return JSON with 'prompt' (detailed 30-60 word prompt), 'style' (the art style detected), and 'tags' (array of 5-8 relevant tags)." },
            { role: "user", content: [{ type: "text", text: "Analyze this image and generate a detailed prompt that could recreate it." }, { type: "image_url", image_url: { url: imageUrl } }] },
          ]);
          break;
        }
        case "prompt_gallery": {
          const j = await chatJSON([
            { role: "system", content: "You are a creative AI image prompt expert. Generate 8 unique, highly detailed image prompts. Return JSON object with key 'prompts' that is an array of objects with 'title' (3-5 words), 'prompt' (20-40 words), 'category' (Nature|Fantasy|Sci-Fi|Portrait|Abstract|Architecture|Food|Animals), and 'difficulty' (Easy|Medium|Hard)." },
            { role: "user", content: prompt || "Generate diverse trending AI art prompts for various styles" },
          ]);
          const list = j?.prompts ?? j?.suggestions ?? (Array.isArray(j) ? j : null) ??
            (Object.values(j || {}).find((v) => Array.isArray(v)) as any[] | undefined);
          result = { prompts: list || [] };
          break;
        }
      }
    } catch (e) {
      await refund();
      const msg = e instanceof Error ? e.message : "Unknown error";
      return json({ error: msg }, 500);
    }

    if (cost > 0) {
      supabase.from("ai_usage_history").insert({
        user_id: user.id,
        usage_type: `image_${action}`,
        credits_used: cost,
        description: `AI Image ${action}: ${(prompt || "").substring(0, 100)}`,
      }).then(() => {}, () => {});
    }
    if (["generate", "variations", "inpainting", "style_transfer", "outpainting", "bg_replace", "reference_image", "logo_text"].includes(action) && prompt) {
      (async () => {
        const { data: existing } = await supabase
          .from("ai_prompt_history")
          .select("id, use_count")
          .eq("user_id", user.id)
          .eq("prompt", prompt)
          .maybeSingle();
        if (existing) {
          await supabase.from("ai_prompt_history")
            .update({ use_count: (existing.use_count || 1) + 1, last_used_at: new Date().toISOString() })
            .eq("id", existing.id);
        } else {
          await supabase.from("ai_prompt_history").insert({
            user_id: user.id, prompt, title: prompt.substring(0, 50), category: action,
          });
        }
      })().catch(() => {});
    }

    return json(result);
  } catch (error) {
    console.error("Unhandled error:", error);
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
