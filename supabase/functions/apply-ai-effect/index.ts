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
    const { imageUrl, effectId, effectName } = await req.json();

    if (!imageUrl || !effectId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Define effect prompts
    const effectPrompts: Record<string, string> = {
      'sway-dance': 'Transform this into a dynamic sway dance scene with motion blur and vibrant energy',
      'wave-dance': 'Apply wave dance effect with flowing movements and rhythmic visual patterns',
      'ghibli': 'Transform into Studio Ghibli anime art style with soft watercolor aesthetics and dreamy atmosphere',
      'minecraft': 'Convert to Minecraft blocky voxel art style with pixelated textures',
      'earth-zoom': 'Add dramatic earth zoom perspective effect from space',
      'box-me': 'Transform into creative cardboard box art with geometric shapes',
      'paper-fall': 'Add falling paper effect with dynamic movement and artistic composition',
      'style-me': 'Apply professional fashion makeover with trendy styling and dramatic lighting',
      'nap-me': 'Transform into peaceful relaxing scene with soft cozy atmosphere',
      'spin-360': 'Add 360 degree rotation effect with dynamic motion blur',
    };

    const prompt = effectPrompts[effectId] || `Apply ${effectName} effect to this image`;

    console.log('Applying effect:', effectId, 'with prompt:', prompt);

    // Call Lovable AI for image editing
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
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        modalities: ['image', 'text']
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your Lovable AI workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl_result = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl_result) {
      throw new Error('No image generated');
    }

    console.log('Effect applied successfully');

    return new Response(
      JSON.stringify({ imageUrl: imageUrl_result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error applying effect:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to apply effect' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
