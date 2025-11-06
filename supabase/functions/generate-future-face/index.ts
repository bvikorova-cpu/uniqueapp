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
    const { imageUrl, yearsForward, includeComparison } = await req.json();
    
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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Generate healthy lifestyle version
    const healthyPrompt = `Age this person by ${yearsForward} years with HEALTHY LIFESTYLE: 
    Show natural, graceful aging with glowing skin, minimal wrinkles, vibrant appearance, healthy hair with natural graying, 
    fit physique, bright eyes, and youthful energy. This is the result of good nutrition, exercise, sleep, and stress management. 
    Photorealistic, professional portrait, dignified and vibrant aging.`;
    
    let healthyImageUrl = null;
    
    try {
      const healthyResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
                  text: healthyPrompt
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

      if (healthyResponse.ok) {
        const healthyData = await healthyResponse.json();
        healthyImageUrl = healthyData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      }
    } catch (imgError) {
      console.error('Healthy image generation error:', imgError);
    }

    // Generate unhealthy lifestyle version if comparison is requested
    let unhealthyImageUrl = null;
    
    if (includeComparison) {
      const unhealthyPrompt = `Age this person by ${yearsForward} years with UNHEALTHY LIFESTYLE: 
      Show accelerated aging with dull, sagging skin, deep wrinkles, tired appearance, thinning gray hair, 
      less toned physique, tired eyes with bags, and worn look. This is the result of poor diet, lack of exercise, 
      poor sleep, smoking, excessive alcohol, and high stress. Photorealistic, professional portrait, showing effects of neglect.`;
      
      try {
        const unhealthyResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
                    text: unhealthyPrompt
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

        if (unhealthyResponse.ok) {
          const unhealthyData = await unhealthyResponse.json();
          unhealthyImageUrl = unhealthyData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        }
      } catch (imgError) {
        console.error('Unhealthy image generation error:', imgError);
      }
    }

    // Generate anti-aging tips
    const tipsResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: 'You are an expert in healthy aging and anti-aging strategies. Provide practical, evidence-based advice.'
          },
          {
            role: 'user',
            content: `Provide 5 key anti-aging tips to maintain youthful appearance and health over the next ${yearsForward} years. Include diet, exercise, skincare, lifestyle and mental health advice. Keep it under 200 words, actionable and motivating.`
          }
        ],
      }),
    });

    const tipsData = await tipsResponse.json();
    const antiAgingTips = tipsData.choices[0].message.content;

    // Save to database
    const { data: progression, error: progError } = await supabase
      .from('future_face_progressions')
      .insert({
        user_id: user.id,
        original_image_url: imageUrl,
        healthy_image_url: healthyImageUrl,
        unhealthy_image_url: unhealthyImageUrl,
        years_forward: yearsForward,
        anti_aging_tips: antiAgingTips,
        has_comparison: includeComparison
      })
      .select()
      .single();

    if (progError) throw progError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        progression: {
          ...progression,
          healthyImageUrl,
          unhealthyImageUrl,
          antiAgingTips
        }
      }),
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
