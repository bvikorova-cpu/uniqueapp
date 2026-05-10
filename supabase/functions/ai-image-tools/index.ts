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
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const OPENAI_IMAGE_URL = "https://api.openai.com/v1/images/generations";
const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    // Auth (clean 401 instead of crashing on null Authorization)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing Authorization header" }, 401);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return json({ error: "Not authenticated" }, 401);

    const body = await req.json().catch(() => ({}));
    const { action, prompt, imageUrl, style, targetSize, editPrompt, region, variationIndex } = body ?? {};
    if (!action || typeof action !== "string") return json({ error: "Missing action" }, 400);
    if (!(action in TOOL_COSTS)) return json({ error: `Unknown action: ${action}` }, 400);

    const cost = TOOL_COSTS[action] || 0;

    // Reserve credits BEFORE calling OpenAI; refund on failure.
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

    // Helper: call image API, return data:image/png;base64 URL or throw with detail.
    const generateImage = async (p: string, size = "1024x1024") => {
      const res = await fetch(OPENAI_IMAGE_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt: p,
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

    // Helper: call chat completions (for vision + text JSON)
    const chatJSON = async (messages: any[]) => {
      const res = await fetch(OPENAI_CHAT_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          response_format: { type: "json_object" },
        }),
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

    let result: any = {};
    try {
      switch (action) {
        case "generate": {
          if (!prompt?.trim()) throw new Error("Prompt is required");
          result = { imageUrl: await generateImage(prompt) };
          break;
        }
        case "edit": {
          if (!prompt?.trim()) throw new Error("Prompt is required");
          result = {
            imageUrl: await generateImage(
              `${prompt}. Based on the original image concept, create an edited version.`,
            ),
          };
          break;
        }
        case "style_transfer": {
          if (!prompt?.trim() || !style) throw new Error("Prompt and style required");
          result = {
            imageUrl: await generateImage(
              `Recreate this concept in the style of ${style}: ${prompt}. Make it a masterful artistic interpretation.`,
            ),
          };
          break;
        }
        case "upscale": {
          if (!prompt?.trim()) throw new Error("Prompt is required");
          const validSizes = ["1024x1024", "1792x1024", "1024x1792"];
          const size = validSizes.includes(targetSize) ? targetSize : "1024x1024";
          result = {
            imageUrl: await generateImage(
              `Create a highly detailed, ultra high resolution, sharp, crystal clear version of: ${prompt}. Maximum detail, 4K quality, enhanced textures and lighting.`,
              size,
            ),
          };
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
          result = {
            imageUrl: await generateImage(
              `${prompt}, rendered ${variationStyles[idx % variationStyles.length]}`,
            ),
          };
          break;
        }
        case "inpainting": {
          if (!prompt?.trim() || !editPrompt?.trim()) throw new Error("Prompt and editPrompt required");
          result = {
            imageUrl: await generateImage(
              `Create an image of: ${prompt}. However, specifically for the ${region || "selected"} area: ${editPrompt}. The rest of the image should remain consistent with the original concept.`,
            ),
          };
          break;
        }
        case "image_to_prompt": {
          if (!imageUrl) throw new Error("imageUrl is required");
          result = await chatJSON([
            {
              role: "system",
              content:
                "You analyze images and generate detailed prompts that could recreate them. Return JSON with 'prompt' (detailed 30-60 word prompt), 'style' (the art style detected), and 'tags' (array of 5-8 relevant tags).",
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Analyze this image and generate a detailed prompt that could recreate it." },
                { type: "image_url", image_url: { url: imageUrl } },
              ],
            },
          ]);
          break;
        }
        case "prompt_gallery": {
          const json = await chatJSON([
            {
              role: "system",
              content:
                "You are a creative AI image prompt expert. Generate 8 unique, highly detailed image prompts. Return JSON object with key 'prompts' that is an array of objects with 'title' (3-5 words), 'prompt' (20-40 words), 'category' (Nature|Fantasy|Sci-Fi|Portrait|Abstract|Architecture|Food|Animals), and 'difficulty' (Easy|Medium|Hard).",
            },
            { role: "user", content: prompt || "Generate diverse trending AI art prompts for various styles" },
          ]);
          // Normalize various shapes
          const list = json?.prompts ?? json?.suggestions ?? (Array.isArray(json) ? json : null) ??
            (Object.values(json || {}).find((v) => Array.isArray(v)) as any[] | undefined);
          result = { prompts: list || [] };
          break;
        }
      }
    } catch (e) {
      await refund();
      const msg = e instanceof Error ? e.message : "Unknown error";
      return json({ error: msg }, 500);
    }

    // Best-effort: log usage + save prompt history (don't fail the request if these fail)
    if (cost > 0) {
      supabase.from("ai_usage_history").insert({
        user_id: user.id,
        usage_type: `image_${action}`,
        credits_used: cost,
        description: `AI Image ${action}: ${(prompt || "").substring(0, 100)}`,
      }).then(() => {}, () => {});
    }
    if (["generate", "variations", "inpainting", "style_transfer"].includes(action) && prompt) {
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
            user_id: user.id,
            prompt,
            title: prompt.substring(0, 50),
            category: action,
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
