import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { withRateLimit, RATE_LIMITS } from "../_shared/rate-limit.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limit check
    const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.ai_generation, corsHeaders);
    if (rateLimitResponse) return rateLimitResponse;

    const { prompt, style, colorScheme, placement, size } = await req.json();
    
    console.log('Generating tattoo with params:', { prompt, style, colorScheme, placement, size });

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Build detailed prompt for tattoo generation
    const fullPrompt = `Create a professional ${style} style tattoo design. ${prompt}. 
    ${colorScheme === 'color' ? 'Use vibrant colors.' : 'Create in black and grey/ink style.'} 
    ${size ? `The design should be suitable for ${size} size.` : ''} 
    ${placement ? `Optimized for placement on ${placement}.` : ''} 
    High detail, clean lines, professional tattoo art quality. White background. Ultra high resolution.`;

    console.log('Full prompt:', fullPrompt);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: fullPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'high',
        output_format: 'webp',
        output_compression: 90,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');

    const base64Image = data.data?.[0]?.b64_json;
    if (!base64Image) {
      console.error('No image in response:', data);
      throw new Error('No image generated');
    }

    const imageUrl = `data:image/webp;base64,${base64Image}`;
    console.log('Tattoo generated successfully');

    return new Response(
      JSON.stringify({ 
        imageUrl,
        message: 'Tattoo design generated successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in generate-tattoo function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
