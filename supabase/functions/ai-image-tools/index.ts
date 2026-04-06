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

    const { action, prompt, imageUrl, style, targetSize } = await req.json();
    const cost = TOOL_COSTS[action] || 0;

    // Check credits for paid tools
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

      // Deduct credits
      await supabase
        .from('ai_credits')
        .update({
          credits_remaining: credits.credits_remaining - cost,
          last_used_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      await supabase.from('ai_usage_history').insert({
        user_id: user.id,
        usage_type: `image_${action}`,
        credits_used: cost,
        description: `AI Image ${action}: ${(prompt || '').substring(0, 100)}`
      });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    let result: any = {};

    switch (action) {
      case 'generate': {
        const response = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gpt-image-1",
            prompt,
            n: 1,
            size: "1024x1024",
            quality: "high",
            output_format: "webp",
            output_compression: 90,
          }),
        });
        if (!response.ok) {
          const err = await response.text();
          console.error("OpenAI error:", err);
          throw new Error("Image generation failed");
        }
        const data = await response.json();
        const b64 = data.data?.[0]?.b64_json;
        if (!b64) throw new Error("No image generated");
        result = { imageUrl: `data:image/webp;base64,${b64}` };
        break;
      }

      case 'edit': {
        // Use GPT-4o to describe the edit, then generate a new image
        const editPrompt = `${prompt}. Based on the original image concept, create an edited version.`;
        const response = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gpt-image-1",
            prompt: editPrompt,
            n: 1,
            size: "1024x1024",
            quality: "high",
            output_format: "webp",
          }),
        });
        if (!response.ok) throw new Error("Image editing failed");
        const data = await response.json();
        const b64 = data.data?.[0]?.b64_json;
        if (!b64) throw new Error("No image generated");
        result = { imageUrl: `data:image/webp;base64,${b64}` };
        break;
      }

      case 'style_transfer': {
        const stylePrompt = `Recreate this concept in the style of ${style}: ${prompt}. Make it a masterful artistic interpretation.`;
        const response = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gpt-image-1",
            prompt: stylePrompt,
            n: 1,
            size: "1024x1024",
            quality: "high",
            output_format: "webp",
          }),
        });
        if (!response.ok) throw new Error("Style transfer failed");
        const data = await response.json();
        const b64 = data.data?.[0]?.b64_json;
        if (!b64) throw new Error("No image generated");
        result = { imageUrl: `data:image/webp;base64,${b64}` };
        break;
      }

      case 'upscale': {
        // Use AI to create an enhanced/upscaled version
        const upscalePrompt = `Create a highly detailed, ultra high resolution, sharp, crystal clear version of: ${prompt}. Maximum detail, 4K quality, enhanced textures and lighting.`;
        const size = targetSize === '1792x1024' ? '1792x1024' : targetSize === '1024x1792' ? '1024x1792' : '1024x1024';
        const response = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gpt-image-1",
            prompt: upscalePrompt,
            n: 1,
            size,
            quality: "high",
            output_format: "webp",
          }),
        });
        if (!response.ok) throw new Error("Upscale failed");
        const data = await response.json();
        const b64 = data.data?.[0]?.b64_json;
        if (!b64) throw new Error("No image generated");
        result = { imageUrl: `data:image/webp;base64,${b64}` };
        break;
      }

      case 'prompt_gallery': {
        // Use GPT to generate creative prompt suggestions
        const chatResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are a creative AI image prompt expert. Generate 8 unique, highly detailed image prompts. Return JSON array of objects with 'title' (short 3-5 word title), 'prompt' (detailed 20-40 word prompt), 'category' (one of: Nature, Fantasy, Sci-Fi, Portrait, Abstract, Architecture, Food, Animals), and 'difficulty' (Easy, Medium, Hard)."
              },
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
