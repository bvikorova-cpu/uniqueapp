import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };

const TOOL_COSTS: Record<string, number> = { generate: 5,
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
  prompt_enhance: 1 };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" } });

const OPENAI_IMAGE_URL = "https://api.openai.com/v1/images/generations";
const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const LOVABLE_IMAGE_URL = "https://ai.gateway.lovable.dev/v1/images/generations";
const LOVABLE_CHAT_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const svgDataUri = (svg: string) =>
  `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;

const buildMotionKeyframeFallback = (promptText: string, aspectRatio?: string) => {
  const landscape = aspectRatio !== "9:16" && aspectRatio !== "3:4" && aspectRatio !== "4:5";
  const width = landscape ? 1600 : 1024;
  const height = landscape ? 900 : 1536;
  const safePrompt = (promptText || "dynamic animation")
    .replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "\"": "&quot;" }[c] ?? c))
    .slice(0, 140);
  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#7c3aed"/>
          <stop offset="0.48" stop-color="#ec4899"/>
          <stop offset="1" stop-color="#f59e0b"/>
        </linearGradient>
        <filter id="blur"><feGaussianBlur stdDeviation="18"/></filter>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      <g opacity="0.28" filter="url(#blur)">
        <circle cx="${width * 0.22}" cy="${height * 0.28}" r="${Math.min(width, height) * 0.22}" fill="#ffffff"/>
        <circle cx="${width * 0.78}" cy="${height * 0.7}" r="${Math.min(width, height) * 0.26}" fill="#111827"/>
      </g>
      <g fill="none" stroke="#ffffff" stroke-width="${Math.max(8, width * 0.012)}" stroke-linecap="round" opacity="0.78">
        <path d="M ${width * 0.12} ${height * 0.62} C ${width * 0.34} ${height * 0.22}, ${width * 0.62} ${height * 0.88}, ${width * 0.9} ${height * 0.34}"/>
        <path d="M ${width * 0.18} ${height * 0.75} C ${width * 0.4} ${height * 0.42}, ${width * 0.62} ${height * 0.62}, ${width * 0.86} ${height * 0.18}" opacity="0.42"/>
      </g>
      <g font-family="Inter, Arial, sans-serif" fill="#ffffff">
        <text x="${width * 0.08}" y="${height * 0.16}" font-size="${width * 0.052}" font-weight="900" letter-spacing="0">Motion keyframe</text>
        <text x="${width * 0.08}" y="${height * 0.23}" font-size="${width * 0.026}" font-weight="700" opacity="0.86">${safePrompt}</text>
        <text x="${width * 0.08}" y="${height * 0.9}" font-size="${width * 0.022}" font-weight="700" opacity="0.72">AI preview fallback — ready to regenerate when the image model is available</text>
      </g>
    </svg>`);
};

const buildTilePatternFallback = (promptText: string, patternType?: string) => {
  const safePrompt = (promptText || "seamless pattern")
    .replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "\"": "&quot;" }[c] ?? c))
    .slice(0, 120);
  const safeType = (patternType || "seamless tile")
    .replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "\"": "&quot;" }[c] ?? c))
    .slice(0, 60);

  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#faf5ff"/>
          <stop offset="0.52" stop-color="#fdf2f8"/>
          <stop offset="1" stop-color="#fff7ed"/>
        </linearGradient>
        <pattern id="tile" width="240" height="240" patternUnits="userSpaceOnUse">
          <rect width="240" height="240" fill="url(#bg)"/>
          <circle cx="60" cy="60" r="34" fill="#a855f7" opacity="0.36"/>
          <circle cx="180" cy="180" r="42" fill="#ec4899" opacity="0.32"/>
          <path d="M 28 190 C 74 124, 120 124, 212 48" fill="none" stroke="#f97316" stroke-width="14" stroke-linecap="round" opacity="0.34"/>
          <path d="M 12 28 L 68 28 L 68 84 L 12 84 Z" fill="none" stroke="#7c3aed" stroke-width="8" opacity="0.3"/>
          <path d="M 154 34 C 202 50, 210 102, 170 132 C 130 104, 120 56, 154 34 Z" fill="#22c55e" opacity="0.22"/>
          <circle cx="120" cy="120" r="10" fill="#111827" opacity="0.18"/>
        </pattern>
      </defs>
      <rect width="1200" height="1200" fill="url(#tile)"/>
      <rect x="92" y="882" width="1016" height="206" rx="34" fill="#ffffff" opacity="0.86"/>
      <g font-family="Inter, Arial, sans-serif" fill="#111827">
        <text x="132" y="948" font-size="48" font-weight="900" letter-spacing="0">Seamless tile preview</text>
        <text x="132" y="1008" font-size="30" font-weight="800" opacity="0.72">${safeType}</text>
        <text x="132" y="1056" font-size="28" font-weight="700" opacity="0.64">${safePrompt}</text>
      </g>
    </svg>`);
};

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const authSupabase = createClient(supabaseUrl, supabaseAnonKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing Authorization header" }, 401);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await authSupabase.auth.getUser(token);
    if (!user) return json({ error: "Not authenticated" }, 401);

    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey || supabaseAnonKey,
      supabaseServiceKey ? undefined : { global: { headers: { Authorization: authHeader } } },
    );

    const body = await req.json().catch(() => ({}));
    const { action, prompt, imageUrl, style, targetSize, editPrompt, region, variationIndex,
      // NEW params
      aspectRatio, negativePrompt, seed, referenceImageUrl, referencePrompt,
      backgroundPrompt, logoText, brandName, sketchDescription, characterName,
      characterDescription, pose, patternType, count } = body ?? {};

    if (!action || typeof action !== "string") return json({ error: "Missing action" }, 400);
    if (!(action in TOOL_COSTS)) return json({ error: `Unknown action: ${action}` }, 400);

    const cost = TOOL_COSTS[action] || 0;

    let charged = false;
    if (cost > 0) {
      const { data: credits } = await supabase
        .from("ai_credits")
        .select("credits_remaining")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!credits || credits.credits_remaining < cost) {
        return json({ error: `Insufficient credits. Need ${cost} credits.` }, 402);
      }
      const { error: deductErr } = await supabase.rpc("deduct_ai_credits", {
        p_user_id: user.id,
        p_amount: cost,
        p_reason: `AI Image ${action}`,
        p_source: "ai-image-tools",
      });
      if (deductErr) return json({ error: "Failed to reserve credits" }, 500);
      charged = true;
    }

    const refund = async () => {
      if (cost > 0 && charged) {
        await supabase.rpc("add_ai_credits", {
          p_user_id: user.id,
          p_amount: cost,
          p_reason: `AI Image ${action} refund`,
          p_source: "ai-image-tools",
        });
      }
    };

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const preferOpenAI = (Deno.env.get("AI_PROVIDER") ?? "").toLowerCase() === "openai";
    const rawFetch = ((globalThis as any).__ORIGINAL_FETCH__ as typeof fetch | undefined) ?? fetch;
    if (!OPENAI_API_KEY && !LOVABLE_API_KEY) {
      await refund();
      return json({ error: "AI service is not configured" }, 500);
    }

    const SUPPORTED_SIZES = ["1024x1024", "1024x1536", "1536x1024", "auto"];
    const normalizeSize = (s?: string) => {
      if (!s || SUPPORTED_SIZES.includes(s)) return s || "1024x1024";
      const [w, h] = s.split("x").map(Number);
      if (!w || !h) return "1024x1024";
      if (w === h) return "1024x1024";
      return w > h ? "1536x1024" : "1024x1536";
    };
    const generateImage = async (p: string, rawSize = "1024x1024") => {
      const size = normalizeSize(rawSize);
      // Append negative prompt as natural-language exclusion if provided
      const finalPrompt = negativePrompt && typeof negativePrompt === "string" && negativePrompt.trim()
        ? `${p}\n\nDo NOT include: ${negativePrompt.trim()}.`
        : p;
      const useLovable = Boolean(LOVABLE_API_KEY && (!preferOpenAI || !OPENAI_API_KEY));
      const res = await rawFetch(useLovable ? LOVABLE_IMAGE_URL : OPENAI_IMAGE_URL, {
        method: "POST",
        headers: useLovable
          ? { Authorization: `Bearer ${LOVABLE_API_KEY ?? ""}`, "Content-Type": "application/json" }
          : { Authorization: `Bearer ${OPENAI_API_KEY ?? ""}`, "Content-Type": "application/json" },
        body: JSON.stringify(useLovable
          ? { model: "openai/gpt-image-1-mini", prompt: finalPrompt, size, quality: "low" }
          : { model: "gpt-image-1", prompt: finalPrompt, n: 1, size, quality: "low" }) });
      if (!res.ok) {
        const text = await res.text();
        console.error(`${useLovable ? "Lovable" : "OpenAI"} image API error:`, res.status, text);
        if (useLovable && OPENAI_API_KEY) {
          const fallback = await rawFetch(OPENAI_IMAGE_URL, {
            method: "POST",
            headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: "gpt-image-1", prompt: finalPrompt, n: 1, size, quality: "low" }) });
          if (fallback.ok) {
            const data = await fallback.json();
            const b64 = data?.data?.[0]?.b64_json;
            if (b64) return `data:image/png;base64,${b64}`;
          }
        }
        throw new Error(`Image generation failed (${res.status})`);
      }
      const data = await res.json();
      const b64 = data?.data?.[0]?.b64_json;
      if (!b64) throw new Error("No image returned by AI");
      return `data:image/png;base64,${b64}`;
    };

    // Real image-to-image edit: sends the uploaded image + instruction to a Gemini image model
    const editUploadedImage = async (sourceUrl: string, instruction: string) => {
      if (!LOVABLE_API_KEY) throw new Error("Image editing is not configured");
      const res = await rawFetch(LOVABLE_IMAGE_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3.1-flash-image",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: `Edit this image: ${instruction}. Keep the original subject, composition and identity intact unless the instruction says otherwise. Return only the edited image.` },
                { type: "image_url", image_url: { url: sourceUrl } },
              ],
            },
          ],
          modalities: ["image", "text"],
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("Lovable image edit error:", res.status, text);
        throw new Error(`Image editing failed (${res.status})`);
      }
      const data = await res.json();
      const b64 = data?.data?.[0]?.b64_json;
      if (!b64) throw new Error("No edited image returned by AI");
      return `data:image/png;base64,${b64}`;
    };



    const parseJSON = (content: string) => {
      try { return JSON.parse(content); } catch { /* try fenced/embedded JSON below */ }
      const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim();
      if (fenced) {
        try { return JSON.parse(fenced); } catch { /* continue */ }
      }
      const start = content.indexOf("{");
      const end = content.lastIndexOf("}");
      if (start >= 0 && end > start) return JSON.parse(content.slice(start, end + 1));
      throw new Error("AI returned invalid JSON");
    };

    const chatJSON = async (messages: any[]) => {
      const useLovable = Boolean(LOVABLE_API_KEY && (!preferOpenAI || !OPENAI_API_KEY));
      const call = async (lovable: boolean) => rawFetch(lovable ? LOVABLE_CHAT_URL : OPENAI_CHAT_URL, {
        method: "POST",
        headers: lovable
          ? { "Lovable-API-Key": LOVABLE_API_KEY ?? "", "Content-Type": "application/json" }
          : { Authorization: `Bearer ${OPENAI_API_KEY ?? ""}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: lovable ? "google/gemini-3.6-flash" : "gpt-4o-mini",
          messages,
          max_tokens: 4096,
          response_format: { type: "json_object" },
        }) });


      let res = await call(useLovable);
      if (!res.ok && useLovable && OPENAI_API_KEY) {
        const text = await res.text().catch(() => "");
        console.error("Lovable chat API error:", res.status, text);
        res = await call(false);
      }
      if (!res.ok) {
        const text = await res.text();
        console.error(`${useLovable ? "AI" : "OpenAI"} chat API error:`, res.status, text);
        throw new Error(`AI request failed (${res.status})`);
      }
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty AI response");
      return parseJSON(content);
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
          try {
            result = { imageUrl: await generateImage(`A ${type} pattern of: ${prompt}. Perfectly seamless, edges that tile infinitely without visible seams, high-detail repeating texture.`, "1024x1024") };
          } catch (tileError) {
            console.error("tile_pattern AI failed, using local fallback:", tileError);
            await refund();
            charged = false;
            result = {
              imageUrl: buildTilePatternFallback(prompt, type),
              note: "AI image model is busy, so I returned a free seamless-pattern preview and refunded the credits." };
          }
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
          try {
            // Render a stylized motion-blur frame as preview; true video is out of scope here.
            result = {
              imageUrl: await generateImage(`A single keyframe representing the START of an animation: ${prompt}. Add subtle motion-blur and dynamic energy hinting at movement.`, size),
              note: "Static keyframe preview. Full video animation coming soon." };
          } catch (animationError) {
            console.error("animate_image AI failed, using local fallback:", animationError);
            await refund();
            charged = false;
            result = {
              imageUrl: buildMotionKeyframeFallback(prompt, aspectRatio),
              note: "AI image model is busy, so I returned a free motion-keyframe fallback and refunded the credits." };
          }
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
          const fallbackPrompts = (theme: string) => {
            const t = theme?.trim() || "trending AI art";
            return [
              { title: "Golden Hour Vista", prompt: `Sweeping landscape inspired by ${t}, golden hour light, volumetric rays, ultra detailed, 8k photography`, category: "Nature", difficulty: "Easy" },
              { title: "Neon Dreamscape", prompt: `Futuristic neon-lit scene of ${t}, rain-soaked reflections, cinematic wide shot, cyberpunk color grading`, category: "Sci-Fi", difficulty: "Medium" },
              { title: "Painted Myth", prompt: `Epic fantasy oil painting depicting ${t}, dramatic chiaroscuro lighting, intricate detail, classical composition`, category: "Fantasy", difficulty: "Hard" },
              { title: "Studio Portrait", prompt: `Editorial studio portrait themed around ${t}, softbox lighting, 85mm lens, shallow depth of field, photorealistic skin`, category: "Portrait", difficulty: "Medium" },
              { title: "Abstract Flow", prompt: `Abstract fluid art interpretation of ${t}, iridescent gradients, macro texture, museum-grade print quality`, category: "Abstract", difficulty: "Easy" },
              { title: "Concrete Poetry", prompt: `Minimalist architectural photograph inspired by ${t}, brutalist concrete forms, hard shadows, symmetrical framing`, category: "Architecture", difficulty: "Medium" },
              { title: "Gourmet Close-Up", prompt: `Michelin-style food photography of a dish inspired by ${t}, moody dark backdrop, steam, glistening textures`, category: "Food", difficulty: "Easy" },
              { title: "Wild Encounter", prompt: `Wildlife photograph capturing ${t}, telephoto compression, natural habitat, razor-sharp eyes, National Geographic style`, category: "Animals", difficulty: "Hard" },
            ];
          };
          try {
            const j = await chatJSON([
              { role: "system", content: "You are a creative AI image prompt expert. Generate 8 unique, highly detailed image prompts. Return JSON object with key 'prompts' that is an array of objects with 'title' (3-5 words), 'prompt' (20-40 words), 'category' (Nature|Fantasy|Sci-Fi|Portrait|Abstract|Architecture|Food|Animals), and 'difficulty' (Easy|Medium|Hard)." },
              { role: "user", content: prompt || "Generate diverse trending AI art prompts for various styles" },
            ]);
            const list = j?.prompts ?? j?.suggestions ?? (Array.isArray(j) ? j : null) ??
              (Object.values(j || {}).find((v) => Array.isArray(v)) as any[] | undefined);
            const clean = (list || []).filter((item: any) => (typeof item === "string" ? item.trim() : item?.prompt?.trim()));
            result = { prompts: clean.length > 0 ? clean : fallbackPrompts(prompt) };
          } catch (galleryError) {
            console.error("prompt_gallery AI failed, using fallback:", galleryError);
            result = { prompts: fallbackPrompts(prompt) };
          }
          break;
        }

      }
    } catch (e) {
      await refund();
      const msg = e instanceof Error ? e.message : "Unknown error";
      return json({ error: msg }, 500);
    }

    if (cost > 0 && charged) {
      supabase.from("ai_usage_history").insert({
        user_id: user.id,
        usage_type: `image_${action}`,
        credits_used: cost,
        description: `AI Image ${action}: ${(prompt || "").substring(0, 100)}` }).then(() => {}, () => {});
    }
    const historyActions = ["generate", "variations", "inpainting", "style_transfer", "outpainting", "bg_replace", "reference_image", "logo_text"];
    const historyPrompts: string[] = action === "image_to_prompt" && typeof result?.prompt === "string"
      ? [result.prompt]
      : action === "prompt_gallery" && Array.isArray(result?.prompts)
        ? result.prompts
          .map((item: any) => typeof item === "string" ? item : item?.prompt)
          .filter((value: unknown): value is string => typeof value === "string" && value.trim().length > 0)
          .slice(0, 8)
        : historyActions.includes(action) && typeof prompt === "string" && prompt.trim().length > 0
          ? [prompt]
          : [];

    if (historyPrompts.length > 0) {
      try {
        for (const historyPrompt of historyPrompts) {
          const { data: existing } = await supabase
            .from("ai_prompt_history")
            .select("id, use_count")
            .eq("user_id", user.id)
            .eq("prompt", historyPrompt)
            .maybeSingle();
          if (existing) {
            await supabase.from("ai_prompt_history")
              .update({ use_count: (existing.use_count || 1) + 1, last_used_at: new Date().toISOString() })
              .eq("id", existing.id);
          } else { await supabase.from("ai_prompt_history").insert({
              user_id: user.id, prompt: historyPrompt, title: historyPrompt.substring(0, 50), category: action });
          }
        }
      } catch (historyError) {
        console.error("Prompt history save failed:", historyError);
      }
    }

    return json(result);
  } catch (error) {
    console.error("Unhandled error:", error);
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
