import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Check credits
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

    // Generate age progression description using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const descResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
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

    if (!descResponse.ok) {
      throw new Error(`AI API error: ${descResponse.status}`);
    }

    const descData = await descResponse.json();
    const description = descData.choices[0].message.content;

    // Generate aged image using AI image editing
    const imgPrompt = `Age this person by ${yearsForward} years. Show natural aging: subtle wrinkles, gray hair, mature facial features. Photorealistic, professional portrait, dignified aging.`;
    
    let agedImageUrl = null;
    
    try {
      const imgResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
                  text: imgPrompt
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
        }),
      });

      if (imgResponse.ok) {
        const imgData = await imgResponse.json();
        agedImageUrl = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      }
    } catch (imgError) {
      console.error('Image generation error:', imgError);
    }

    // Save age progression to database
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
