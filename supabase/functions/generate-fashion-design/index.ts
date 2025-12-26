import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Rate limit check
    const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.ai_generation, corsHeaders, user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const { 
      title,
      description,
      categoryId,
      styleId,
      materialId,
      colors,
      details,
      qualityLevel = 'basic',
      isPublic = true
    } = await req.json();

    console.log('Generating design for user:', user.id);

    const creditsMap: Record<string, number> = { basic: 5, detailed: 10, premium: 15, collection: 15 };
    const creditsNeeded = creditsMap[qualityLevel as string] || 5;

    const { data: creditData, error: creditError } = await supabaseClient
      .from('ai_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .single();

    if (creditError || !creditData || creditData.credits_remaining < creditsNeeded) {
      return new Response(JSON.stringify({ error: `Insufficient credits. You need ${creditsNeeded} AI credits.` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { error: deductError } = await supabaseClient
      .from('ai_credits')
      .update({ 
        credits_remaining: creditData.credits_remaining - creditsNeeded,
        last_used_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (deductError) {
      console.error('Error deducting credits:', deductError);
      return new Response(JSON.stringify({ error: 'Error processing credits' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await supabaseClient
      .from('ai_usage_history')
      .insert({
        user_id: user.id,
        usage_type: 'fashion_design',
        credits_used: creditsNeeded,
        description: `Generated fashion design: ${title}`
      });

    const { data: category } = await supabaseClient
      .from('fashion_categories')
      .select('name')
      .eq('id', categoryId)
      .single();

    const { data: style } = await supabaseClient
      .from('fashion_styles')
      .select('name')
      .eq('id', styleId)
      .single();

    const { data: material } = await supabaseClient
      .from('fashion_materials')
      .select('name')
      .eq('id', materialId)
      .single();

    const colorString = colors?.length > 0 ? `Colors: ${colors.join(', ')}.` : '';
    const detailsString = details ? `Additional details: ${JSON.stringify(details)}.` : '';
    
    let qualityModifier = '';
    if (qualityLevel === 'premium' || qualityLevel === 'collection') {
      qualityModifier = 'Ultra high resolution, professional fashion photography quality, 8K detail, magazine cover quality.';
    } else if (qualityLevel === 'detailed') {
      qualityModifier = 'High resolution, detailed fashion illustration, professional quality.';
    } else {
      qualityModifier = 'Fashion design illustration, clear and detailed.';
    }

    const prompt = `Design a ${style?.name || 'modern'} style ${category?.name || 'clothing'} piece made of ${material?.name || 'fabric'}. ${description || ''}. ${colorString} ${detailsString} ${qualityModifier} Fashion illustration, professional design, centered composition, white background.`;

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: 'Error generating design' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const base64Image = data.data?.[0]?.b64_json;
    
    if (!base64Image) {
      return new Response(JSON.stringify({ error: 'No image generated' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const imageUrl = `data:image/webp;base64,${base64Image}`;

    const { data: design, error: designError } = await supabaseClient
      .from('fashion_designs')
      .insert({
        user_id: user.id,
        category_id: categoryId,
        style_id: styleId,
        material_id: materialId,
        title,
        description,
        prompt,
        image_url: imageUrl,
        credits_used: 0,
        quality_level: qualityLevel,
        colors,
        details,
        is_public: isPublic
      })
      .select()
      .single();

    if (designError) {
      console.error('Save error:', designError);
      return new Response(JSON.stringify({ error: 'Error saving design' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ design, imageUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
