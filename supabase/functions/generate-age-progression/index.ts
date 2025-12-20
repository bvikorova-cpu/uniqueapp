import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    const { imageUrl, yearsForward } = await req.json();
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data: creditsData } = await supabase
      .from('ai_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .single();

    const creditsNeeded = 5;

    if (!creditsData || creditsData.credits_remaining < creditsNeeded) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Generate description using OpenAI
    let description = `Age progression +${yearsForward} years: Natural aging with subtle wrinkles, gray hair, mature facial features.`;
    
    try {
      const descResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert in age progression analysis. Describe how a person might look in the future based on natural aging processes.'
            },
            {
              role: 'user',
              content: `Describe how a person might look ${yearsForward} years in the future. Include details about skin, hair, facial features, and overall appearance. Be realistic but kind. Keep it under 150 words.`
            }
          ],
        }),
      });

      if (descResponse.ok) {
        const descData = await descResponse.json();
        description = descData.choices[0].message.content;
      }
    } catch (e) {
      console.error('Description generation error:', e);
    }

    // Generate aged image using OpenAI
    const imgPrompt = `Age this person by ${yearsForward} years. Show natural aging: subtle wrinkles, gray hair, mature facial features. Photorealistic, professional portrait, dignified aging. Keep the person recognizable.`;
    
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
    formData.append('prompt', imgPrompt);
    formData.append('model', 'gpt-image-1');
    formData.append('size', '1024x1024');

    const imgResponse = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    let agedImageUrl = null;
    
    if (imgResponse.ok) {
      const imgData = await imgResponse.json();
      const base64Image = imgData.data?.[0]?.b64_json;
      if (base64Image) {
        agedImageUrl = `data:image/png;base64,${base64Image}`;
      }
    } else {
      const errorText = await imgResponse.text();
      console.error('OpenAI image error:', imgResponse.status, errorText);
    }

    const { data: progression, error: progError } = await supabase
      .from('age_progressions')
      .insert({
        user_id: user.id,
        original_image_url: imageUrl,
        aged_image_url: agedImageUrl,
        years_forward: yearsForward,
        description,
        credits_used: creditsNeeded
      })
      .select()
      .single();

    if (progError) throw progError;

    await supabase
      .from('ai_credits')
      .update({ 
        credits_remaining: creditsData.credits_remaining - creditsNeeded 
      })
      .eq('user_id', user.id);

    await supabase
      .from('ai_usage_history')
      .insert({
        user_id: user.id,
        usage_type: 'age_progression',
        credits_used: creditsNeeded,
        description: `Age progression +${yearsForward} years`
      });

    return new Response(
      JSON.stringify({ success: true, progression }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
