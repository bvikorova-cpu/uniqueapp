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
      'sway-dance': 'Create a dancing animation with smooth swaying movements',
      'my-girlfriendssss': 'Create a romantic scene with multiple girlfriends in a warm, friendly atmosphere',
      'my-boyfriendssss': 'Create a romantic scene with multiple boyfriends in a warm, friendly atmosphere',
      'earth-zoom-out': 'Create a zoom-out effect as if viewing from space, moving away from Earth',
      'wave-dance': 'Create a wave-like dancing motion effect with fluid movements',
      'earth-zoom-in': 'Create a zoom-in effect as if approaching Earth from space',
      'minecraft': 'Transform into Minecraft block style with pixelated cubic forms and game textures',
      'box-me': 'Transform the subject into a box-like geometric cartoon form',
      'paper-fall': 'Create an effect of colorful paper confetti falling around the subject',
      'style-me': 'Apply stylish fashion transformation with vibrant colors and modern aesthetics',
      'ghibli': 'Transform into Studio Ghibli anime style with soft watercolor tones and whimsical atmosphere',
      'ai-couple-hugging': 'Create a warm, romantic scene of a couple hugging with soft lighting',
      'nap-me': 'Create a peaceful sleeping or napping scene with dreamy atmosphere',
      'spin-360': 'Create a dynamic 360-degree spinning rotation effect',
      'sexy-me': 'Apply an attractive, confident transformation with enhanced features',
      'gender-swap': 'Transform to opposite gender while maintaining facial features',
      'smile': 'Add a bright, genuine smile with happy expression',
      'bodyshake': 'Create a dynamic body shaking dance movement effect',
      'melt': 'Create a melting effect as if the subject is liquefying',
      'bloom-magic': 'Create magical blooming flowers appearing around the subject',
      'paperman': 'Transform into a paper-cut art style character',
      'flying': 'Create an effect of flying through the air with motion blur',
      'balloon-flyaway': 'Create colorful balloons lifting the subject into the sky',
      'expansion': 'Create an expanding or growing effect',
      'pet-lovers': 'Add adorable pets interacting lovingly with the subject',
      'flame-carpet': 'Create a dramatic carpet of flames beneath the subject',
      'fashion-stride': 'Create a confident fashion runway walk effect',
      'send-roses': 'Create an effect of sending or receiving romantic roses',
      'finger-heart': 'Add cute finger heart gesture effect',
      'cartoon-doll': 'Transform into an adorable cartoon doll character',
      'beast-companion': 'Add a magical beast companion next to the subject',
      'bloom-doorobear': 'Add a cute Doraemon-style bear with blooming effects',
      'french-kiss': 'Create a romantic French kiss scene',
      'whos-arrested': 'Create a playful "getting arrested" scene',
      'warmth-of-jesus': 'Create a spiritual scene with divine light and warmth',
      'wild-laugh': 'Create an exaggerated, wild laughing expression',
      'surprised': 'Create a highly surprised, shocked expression',
      'explosion': 'Create a dramatic explosion effect in the background',
      'face-punch': 'Create a comic-style face punch impact effect',
      'ai-kiss': 'Create a romantic AI-generated kissing scene',
      'kungfu-club': 'Transform into a kung-fu action pose with martial arts effects',
      'holy-wings': 'Add beautiful angel wings with divine glow',
      'sheep-curls': 'Add fluffy sheep-like curly hair',
      'ai-muscle-generator': 'Add muscular definition and athletic physique',
      'squish-it': 'Create a squished, compressed cartoon effect',
      'hair-growth-magic': 'Add long, flowing magical hair growth',
      'become-male': 'Transform appearance to masculine features',
      'alive-art': 'Transform into a living painting or artwork',
      'become-female': 'Transform appearance to feminine features',
      'anything-robot': 'Transform into a futuristic robot version'
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
