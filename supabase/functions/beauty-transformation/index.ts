import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Not authenticated');
    }

    const { imageUrl, transformationType, styleApplied } = await req.json();

    // Check AI credits
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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Create transformation prompt based on type
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

    // Generate transformation using AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const transformedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!transformedImageUrl) {
      throw new Error('No image generated');
    }

    // Save transformation to database
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

    // Deduct credits
    await supabaseClient
      .from('ai_credits')
      .update({ credits_remaining: credits.credits_remaining - 5 })
      .eq('user_id', user.id);

    // Log usage
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
