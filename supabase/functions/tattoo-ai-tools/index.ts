import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, ...params } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured');

    if (type === 'style_mix') {
      const { style1, style2, description } = params;
      
      const fullPrompt = `Create a professional tattoo design that is a creative fusion of ${style1} and ${style2} styles. The design: ${description}. 
      Seamlessly blend the characteristics of both styles - the technique, line work, shading, and aesthetic elements from each. 
      High detail, clean lines, professional tattoo art quality. White background. Ultra high resolution.`;

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
          return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const base64Image = data.data?.[0]?.b64_json;
      if (!base64Image) throw new Error('No image generated');

      return new Response(JSON.stringify({ imageUrl: `data:image/webp;base64,${base64Image}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (type === 'aging_simulation') {
      const { years, skinType } = params;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
              content: 'You are a professional tattoo aging expert. Provide detailed, scientific analysis of how tattoos age over time based on skin type, ink quality, and environmental factors. Be specific and helpful.'
            },
            {
              role: 'user',
              content: `Analyze how a tattoo would age over ${years} years on ${skinType} skin. Provide:
              1. Color fading prediction (which colors fade first, how much)
              2. Line blur estimate (fine lines vs thick lines)
              3. Overall appearance change percentage
              4. Recommended touch-up timeline
              5. Care tips to slow aging
              6. Best and worst case scenarios
              Format with clear headers and bullet points.`
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);
      const data = await response.json();
      const analysis = data.choices?.[0]?.message?.content;

      return new Response(JSON.stringify({ analysis }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error(`Unknown tool type: ${type}`);
  } catch (error: any) {
    console.error('tattoo-ai-tools error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
