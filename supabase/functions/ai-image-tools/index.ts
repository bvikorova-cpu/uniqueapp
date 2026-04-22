import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) throw new Error('Not authenticated');

    const { action, prompt, imageUrl, style, targetSize, editPrompt, region, variationIndex } = await req.json();
    const cost = TOOL_COSTS[action] || 0;

    if (cost > 0) {
      const { data: credits } = await supabase
        .from('ai_credits')
        .select('credits_remaining')
        .eq('user_id', user.id)
        .single();

      if (!credits || credits.credits_remaining < cost) {
        return new Response(
          JSON.stringify({ error: `Insufficient credits. Need ${cost} credits.` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
        );
      }

      await supabase
        .from('ai_credits')
        .update({ credits_remaining: credits.credits_remaining - cost, last_used_at: new Date().toISOString() })
        .eq('user_id', user.id);

      await supabase.from('ai_usage_history').insert({
        user_id: user.id,
        usage_type: `image_${action}`,
        credits_used: cost,
        description: `AI Image ${action}: ${(prompt || '').substring(0, 100)}`
      });
    }

    // Save prompt to history for generation actions
    if (['generate', 'variations', 'inpainting', 'style_transfer'].includes(action) && prompt) {
      const { data: existing } = await supabase
        .from('ai_prompt_history')
        .select('id, use_count')
        .eq('user_id', user.id)
        .eq('prompt', prompt)
        .maybeSingle();

      if (existing) {
        await supabase.from('ai_prompt_history').update({ use_count: (existing.use_count || 1) + 1, last_used_at: new Date().toISOString() }).eq('id', existing.id);
      } else {
        await supabase.from('ai_prompt_history').insert({
          user_id: user.id,
          prompt,
          title: prompt.substring(0, 50),
          category: action,
        });
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let result: any = {};

    switch (action) {
      case 'generate': {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "google/gemini-2.5-flash-image-preview", prompt, n: 1, size: "1024x1024", quality: "high", output_format: "webp", output_compression: 90 }),
        });
        if (!response.ok) { console.error("AI gateway error:", await response.text()); throw new Error("Image generation failed"); }
        const data = await response.json();
        const b64Url = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        const b64 = b64Url ? b64Url.replace(/^data:image\/\w+;base64,/, "") : null;
        if (!b64) throw new Error("No image generated");
        result = { imageUrl: `data:image/webp;base64,${b64}` };
        break;
      }

      case 'edit': {
        const editP = `${prompt}. Based on the original image concept, create an edited version.`;
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "google/gemini-2.5-flash-image-preview", messages: [{ role: "user", content: editP }], modalities: ["image", "text"] }),
        });
        if (!response.ok) throw new Error("Image editing failed");
        const data = await response.json();
        const b64Url = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        const b64 = b64Url ? b64Url.replace(/^data:image\/\w+;base64,/, "") : null;
        if (!b64) throw new Error("No image generated");
        result = { imageUrl: `data:image/webp;base64,${b64}` };
        break;
      }

      case 'style_transfer': {
        const styleP = `Recreate this concept in the style of ${style}: ${prompt}. Make it a masterful artistic interpretation.`;
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "google/gemini-2.5-flash-image-preview", messages: [{ role: "user", content: styleP }], modalities: ["image", "text"] }),
        });
        if (!response.ok) throw new Error("Style transfer failed");
        const data = await response.json();
        const b64Url = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        const b64 = b64Url ? b64Url.replace(/^data:image\/\w+;base64,/, "") : null;
        if (!b64) throw new Error("No image generated");
        result = { imageUrl: `data:image/webp;base64,${b64}` };
        break;
      }

      case 'upscale': {
        const upP = `Create a highly detailed, ultra high resolution, sharp, crystal clear version of: ${prompt}. Maximum detail, 4K quality, enhanced textures and lighting.`;
        const size = targetSize === '1792x1024' ? '1792x1024' : targetSize === '1024x1792' ? '1024x1792' : '1024x1024';
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "google/gemini-2.5-flash-image-preview", messages: [{ role: "user", content: upP }], modalities: ["image", "text"] }),
        });
        if (!response.ok) throw new Error("Upscale failed");
        const data = await response.json();
        const b64Url = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        const b64 = b64Url ? b64Url.replace(/^data:image\/\w+;base64,/, "") : null;
        if (!b64) throw new Error("No image generated");
        result = { imageUrl: `data:image/webp;base64,${b64}` };
        break;
      }

      case 'variations': {
        const variationStyles = [
          "photorealistic with dramatic lighting",
          "in a painterly impressionist style with bold brushstrokes",
          "as a stylized digital illustration with vibrant colors",
          "in a moody cinematic style with film grain and shallow depth of field"
        ];
        const idx = variationIndex ?? 0;
        const varP = `${prompt}, rendered ${variationStyles[idx % variationStyles.length]}`;
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "google/gemini-2.5-flash-image-preview", messages: [{ role: "user", content: varP }], modalities: ["image", "text"] }),
        });
        if (!response.ok) throw new Error("Variation generation failed");
        const data = await response.json();
        const b64Url = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        const b64 = b64Url ? b64Url.replace(/^data:image\/\w+;base64,/, "") : null;
        if (!b64) throw new Error("No image generated");
        result = { imageUrl: `data:image/webp;base64,${b64}` };
        break;
      }

      case 'inpainting': {
        const inpP = `Create an image of: ${prompt}. However, specifically for the ${region} area: ${editPrompt}. The rest of the image should remain consistent with the original concept.`;
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "google/gemini-2.5-flash-image-preview", messages: [{ role: "user", content: inpP }], modalities: ["image", "text"] }),
        });
        if (!response.ok) throw new Error("Inpainting failed");
        const data = await response.json();
        const b64Url = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        const b64 = b64Url ? b64Url.replace(/^data:image\/\w+;base64,/, "") : null;
        if (!b64) throw new Error("No image generated");
        result = { imageUrl: `data:image/webp;base64,${b64}` };
        break;
      }

      case 'image_to_prompt': {
        const chatResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "You analyze images and generate detailed prompts that could recreate them. Return JSON with 'prompt' (detailed 30-60 word prompt), 'style' (the art style detected), and 'tags' (array of 5-8 relevant tags)." },
              { role: "user", content: [
                { type: "text", text: "Analyze this image and generate a detailed prompt that could recreate it." },
                { type: "image_url", image_url: { url: imageUrl } }
              ]}
            ],
            response_format: { type: "json_object" }
          }),
        });
        if (!chatResponse.ok) throw new Error("Image analysis failed");
        const chatData = await chatResponse.json();
        const content = chatData.choices?.[0]?.message?.content;
        result = JSON.parse(content);
        break;
      }

      case 'prompt_gallery': {
        const chatResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "You are a creative AI image prompt expert. Generate 8 unique, highly detailed image prompts. Return JSON array of objects with 'title' (short 3-5 word title), 'prompt' (detailed 20-40 word prompt), 'category' (one of: Nature, Fantasy, Sci-Fi, Portrait, Abstract, Architecture, Food, Animals), and 'difficulty' (Easy, Medium, Hard)." },
              { role: "user", content: prompt || "Generate diverse trending AI art prompts for various styles" }
            ],
            response_format: { type: "json_object" }
          }),
        });
        if (!chatResponse.ok) throw new Error("Prompt generation failed");
        const chatData = await chatResponse.json();
        const content = chatData.choices?.[0]?.message?.content;
        result = { prompts: JSON.parse(content) };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
