import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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

    // Trial credits checked on frontend - backend uses owner's API key
    console.log('Generating design for user:', user.id);

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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [{ role: 'user', content: prompt }],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'API credits insufficient. Contact support.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: 'Error generating design' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'No image generated' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
