import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { artistName } = await req.json();
    
    if (!artistName) {
      throw new Error('Artist name is required');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log(`Generating image for ${artistName}`);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: `Generate a professional, high-quality portrait photo of legendary music artist ${artistName}. The image should be photorealistic, iconic, and capture their legendary status. Studio quality, dramatic lighting, focused on face and upper body.`,
        n: 1,
        size: '1024x1024',
        quality: 'high',
        output_format: 'webp',
        output_compression: 90,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      throw new Error(`AI generation failed: ${response.status}`);
    }

    const data = await response.json();
    const base64Image = data.data?.[0]?.b64_json;

    if (!base64Image) {
      throw new Error('No image generated');
    }

    const imageUrl = `data:image/webp;base64,${base64Image}`;
    console.log(`Successfully generated image for ${artistName}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        imageUrl,
        artistName 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-artist-image:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
