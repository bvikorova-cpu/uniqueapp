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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
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

    const prompt = `Create a stunning photorealistic 360-degree equirectangular panoramic view of "${roomName}" - an immersive escape room environment.

Scene details: ${themeStyle}
${description ? `Additional details: ${description}` : ''}

Requirements:
- Full 360° equirectangular projection suitable for VR/panorama viewers
- Highly detailed, photorealistic quality
- Dramatic atmospheric lighting with depth
- Include interactive-looking elements (drawers, safes, books, mysterious objects)
- Rich textures and materials
- Immersive escape room atmosphere with puzzles and clues subtly visible
- Professional theme park quality visuals
- Ultra high resolution, cinematic lighting

Style: Photorealistic escape room interior, immersive, mysterious, detailed props and decorations.`;

    console.log('Calling Lovable AI with prompt...');

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
            content: prompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add more credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`Lovable AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Lovable AI response received');

    // Extract image from response
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      console.error('No image in response:', JSON.stringify(data));
      throw new Error('No image generated in response');
    }

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
