import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { imageUrl, restorationType } = await req.json();
    console.log('Restoring photo:', { imageUrl, restorationType, userId: user.id });

    const { data: creditsData, error: creditsError } = await supabaseClient
      .from('photo_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .maybeSingle();

    if (creditsError) {
      console.error('Error fetching credits:', creditsError);
      throw new Error('Failed to check credits');
    }

    if (!creditsData || creditsData.credits_remaining < 1) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits. Please purchase more credits.' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let prompt = '';
    switch (restorationType) {
      case 'colorize':
        prompt = 'Transform this black and white photo into a natural, realistic colored image. Add appropriate colors based on the historical context and typical colors of the era. Maintain all original details and quality.';
        break;
      case 'repair':
        prompt = 'Repair and restore this damaged photo. Remove scratches, tears, stains, and other imperfections. Reconstruct missing parts naturally. Enhance clarity while preserving the authentic vintage character.';
        break;
      case 'enhance':
        prompt = 'Enhance this photo by improving sharpness, clarity, and overall quality. Reduce noise and grain. Adjust brightness and contrast for optimal viewing. Preserve the original character and authenticity.';
        break;
      default:
        prompt = 'Restore and enhance this old photo. Repair any damage, improve quality, and colorize if it\'s black and white.';
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    console.log('Fetching original image...');
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

    console.log('Calling OpenAI API for restoration...');
    const aiResponse = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('OpenAI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`OpenAI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const base64Image = aiData.data?.[0]?.b64_json;

    if (!base64Image) {
      console.error('No image in OpenAI response:', JSON.stringify(aiData));
      throw new Error('Failed to generate restored image');
    }

    const restoredImageUrl = `data:image/png;base64,${base64Image}`;
    console.log('Image restored successfully');

    const { error: updateError } = await supabaseClient
      .from('photo_credits')
      .update({ 
        credits_remaining: creditsData.credits_remaining - 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating credits:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        restoredImageUrl,
        creditsRemaining: creditsData.credits_remaining - 1
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in restore-old-photo:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
