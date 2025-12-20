import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    const { imageUrl, transformationType, styleApplied } = await req.json();

    const { data: credits } = await supabaseClient
      .from('ai_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .single();

    if (!credits || credits.credits_remaining < 5) {
      return new Response(
        JSON.stringify({ error: 'Insufficient AI credits. Need 5 credits for beauty transformation.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
      );
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    let prompt = '';
    if (transformationType === 'makeup') {
      if (styleApplied === 'glam') {
        prompt = 'Apply glamorous makeup look with dramatic eyes, bold lips, contoured face, false lashes, and highlighter. Keep the person\'s features and skin tone exactly the same.';
      } else if (styleApplied === 'natural') {
        prompt = 'Apply natural, fresh makeup look with subtle eyeshadow, nude lips, light blush, and natural-looking brows. Keep the person\'s features and skin tone exactly the same.';
      } else if (styleApplied === 'smokey') {
        prompt = 'Apply smokey eye makeup look with dark, blended eyeshadow, winged eyeliner, dramatic lashes, and nude lips. Keep the person\'s features and skin tone exactly the same.';
      }
    } else if (transformationType === 'hair') {
      if (styleApplied === 'blonde') {
        prompt = 'Change hair color to beautiful blonde with highlights. Keep the person\'s face, features, and hairstyle exactly the same, only change the hair color.';
      } else if (styleApplied === 'brunette') {
        prompt = 'Change hair color to rich brunette/brown. Keep the person\'s face, features, and hairstyle exactly the same, only change the hair color.';
      } else if (styleApplied === 'red') {
        prompt = 'Change hair color to vibrant red/auburn. Keep the person\'s face, features, and hairstyle exactly the same, only change the hair color.';
      } else if (styleApplied === 'bob') {
        prompt = 'Change hairstyle to a modern bob cut. Keep the person\'s face, features, and hair color exactly the same, only change the hairstyle.';
      } else if (styleApplied === 'long') {
        prompt = 'Transform to long, flowing hair. Keep the person\'s face, features, and hair color exactly the same, only change the length.';
      } else if (styleApplied === 'curly') {
        prompt = 'Transform to beautiful curly hair. Keep the person\'s face, features, and hair color exactly the same, only add curls/waves.';
      }
    } else if (transformationType === 'complete') {
      prompt = `Apply a complete beauty transformation with ${styleApplied} style - including makeup, hairstyle, and overall look. Keep the person recognizable but enhanced.`;
    }

    console.log("Fetching original image...");
    const imageBase64 = await fetchImageAsBase64(imageUrl);

    const binaryString = atob(imageBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const imageBlob = new Blob([bytes], { type: 'image/png' });
    
    const formData = new FormData();
    formData.append('image', imageBlob, 'image.png');
    formData.append('prompt', prompt);
    formData.append('model', 'gpt-image-1');
    formData.append('size', '1024x1024');

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const base64Image = data.data?.[0]?.b64_json;

    if (!base64Image) {
      throw new Error('No image generated');
    }

    const transformedImageUrl = `data:image/png;base64,${base64Image}`;

    const { error: saveError } = await supabaseClient
      .from('beauty_transformations')
      .insert({
        user_id: user.id,
        original_image_url: imageUrl,
        transformed_image_url: transformedImageUrl,
        transformation_type: transformationType,
        style_applied: styleApplied,
        credits_used: 5
      });

    if (saveError) {
      console.error('Error saving transformation:', saveError);
    }

    await supabaseClient
      .from('ai_credits')
      .update({ credits_remaining: credits.credits_remaining - 5 })
      .eq('user_id', user.id);

    await supabaseClient
      .from('ai_usage_history')
      .insert({
        user_id: user.id,
        usage_type: 'beauty_transformation',
        credits_used: 5,
        description: `Beauty transformation: ${transformationType} - ${styleApplied}`
      });

    return new Response(
      JSON.stringify({
        transformedImage: transformedImageUrl,
        creditsRemaining: credits.credits_remaining - 5
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in beauty-transformation:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
