import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { roomName, theme, description } = await req.json();

    if (!roomName || !theme) {
      return new Response(
        JSON.stringify({ error: 'roomName and theme are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating escape room panorama for: ${roomName} (${theme})`);

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Theme-specific prompts for immersive escape room environments
    const themePrompts: Record<string, string> = {
      mystery: "vintage detective office with dim lighting, wooden furniture, scattered papers, old typewriter, magnifying glass, film noir atmosphere, mysterious shadows, bookshelves with leather-bound books",
      horror: "abandoned asylum or haunted hospital, flickering lights, dusty medical equipment, cobwebs, eerie green lighting, cracked walls, mysterious shadows, horror movie atmosphere",
      "sci-fi": "futuristic spaceship interior, glowing control panels, holographic displays, metallic surfaces, neon blue and purple lighting, high-tech equipment, space station corridor",
      adventure: "ancient Egyptian tomb, hieroglyphics on walls, golden artifacts, torch lighting, stone sarcophagus, mysterious treasures, sand and dust particles in air",
      fantasy: "wizard's tower library, floating candles, magical crystals, ancient spellbooks, mystical purple glow, potion bottles, enchanted atmosphere, medieval stone walls"
    };

    const themeStyle = themePrompts[theme] || themePrompts.mystery;

    const prompt = `A stunning photorealistic 360-degree equirectangular panoramic view of "${roomName}" - an immersive escape room environment. ${themeStyle}. ${description || ''} Full 360° equirectangular projection suitable for VR/panorama viewers. Highly detailed, photorealistic quality with dramatic atmospheric lighting. Include interactive elements like drawers, safes, books, mysterious objects. Rich textures and immersive escape room atmosphere with puzzles and clues subtly visible. Professional theme park quality visuals, ultra high resolution, cinematic lighting.`;

    console.log('Calling OpenAI DALL-E with prompt...');

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
        size: '1536x1024',
        quality: 'high',
        output_format: 'png'
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

      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');

    // Extract base64 image from response
    const base64Image = data.data?.[0]?.b64_json;
    
    if (!base64Image) {
      console.error('No image in response:', JSON.stringify(data));
      throw new Error('No image generated in response');
    }

    const imageUrl = `data:image/png;base64,${base64Image}`;

    console.log('Panorama generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        imageUrl: imageUrl,
        roomName: roomName,
        theme: theme
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating escape room panorama:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
