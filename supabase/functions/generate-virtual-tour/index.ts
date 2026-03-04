import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { destination } = await req.json();
    
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

    // Check credits
    const { data: creditsData } = await supabase
      .from('ai_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .single();

    const creditsNeeded = destination === 'Mars' || destination === 'Future Metropolis' ? 5 : 
                         destination === 'Ancient Rome' || destination === 'Underwater City' ? 4 : 3;

    if (!creditsData || creditsData.credits_remaining < creditsNeeded) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate tour description using OpenAI
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are a creative tour guide who creates immersive, detailed virtual tours. Describe locations vividly, include interesting facts, and make the experience feel real.'
          },
          {
            role: 'user',
            content: `Create a detailed virtual tour of ${destination}. Include: 1) A vivid opening description 2) 3-4 interesting locations/sights to visit 3) Historical or scientific facts 4) Sensory details (what you see, hear, smell). Make it engaging and immersive. Keep it under 500 words.`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const tourDescription = aiData.choices[0].message.content;

    // Generate tour images using Lovable AI image generation
    const imagePrompts = [
      `Beautiful panoramic view of ${destination}, ultra high resolution, photorealistic`,
      `Iconic landmark in ${destination}, detailed architecture, golden hour lighting`,
      `Local culture and atmosphere of ${destination}, vibrant colors, immersive scene`
    ];

    const imageUrls: string[] = [];
    
    for (const prompt of imagePrompts) {
      try {
        const imgResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: prompt,
            n: 1,
            size: '1024x1024'
          }),
        });

        if (imgResponse.ok) {
          const imgData = await imgResponse.json();
          const imageUrl = imgData.data?.[0]?.url;
          if (imageUrl) {
            imageUrls.push(imageUrl);
          }
        }
      } catch (imgError) {
        console.error('Image generation error:', imgError);
      }
    }

    // Save tour to database
    const { data: tour, error: tourError } = await supabase
      .from('virtual_tours')
      .insert({
        user_id: user.id,
        destination,
        description: tourDescription,
        image_urls: imageUrls,
        credits_used: creditsNeeded,
        tour_data: {
          generated_at: new Date().toISOString(),
          model: 'google/gemini-2.5-flash'
        }
      })
      .select()
      .single();

    if (tourError) throw tourError;

    // Deduct credits
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
        usage_type: 'virtual_tour',
        credits_used: creditsNeeded,
        description: `Virtual tour to ${destination}`
      });

    return new Response(
      JSON.stringify({ success: true, tour }),
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
