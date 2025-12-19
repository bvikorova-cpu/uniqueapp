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
    const { characterName, characterType } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const prompt = `Create an adorable, highly expressive cartoon character image of ${characterName}, a ${characterType}. Style: Disney/Pixar 3D animated character with big expressive eyes, exaggerated proportions for cuteness, smooth rounded shapes, vibrant saturated colors, and a joyful friendly smile. The character should have a dynamic playful pose with personality, glossy cartoon shading, and be placed on a simple colorful gradient background. Make it look like a professional animated movie character - cheerful, energetic, and irresistibly cute! Ultra high resolution.`;

    console.log('Generating character image with OpenAI:', characterName);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
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
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Failed to generate image: ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    const base64Image = data.data?.[0]?.b64_json;

    if (!base64Image) {
      console.error('No image in response:', data);
      throw new Error('No image generated');
    }

    const imageUrl = `data:image/webp;base64,${base64Image}`;
    console.log('Character image generated successfully');

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating character image:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate image' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
