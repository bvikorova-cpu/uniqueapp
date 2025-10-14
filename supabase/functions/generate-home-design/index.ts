import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { originalImageUrl, roomType, stylePreference, customPrompt } = await req.json();
    
    // Check credits
    const { data: creditsData } = await supabase
      .from('ai_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .single();
    
    if (!creditsData || creditsData.credits_remaining < 10) {
      return new Response(JSON.stringify({ error: 'Insufficient credits' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate design prompt
    const designPrompt = customPrompt || 
      `Professional interior design: Transform this ${roomType} into a beautiful ${stylePreference} style space. 
       Show modern furniture, elegant color scheme, proper lighting, and tasteful decorations. 
       Ultra high resolution, photorealistic, professional photography quality.`;

    console.log('Generating design with prompt:', designPrompt);

    // Call Lovable AI for image generation using Nano banana model
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
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
                text: designPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: originalImageUrl
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
      console.error('AI generation error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'Failed to generate design' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const redesignedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!redesignedImageUrl) {
      console.error('No image in response:', data);
      return new Response(JSON.stringify({ error: 'No image generated' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate product suggestions
    const productSuggestions = [
      { name: 'Modern Sofa', category: 'Furniture', price: '€599', link: '#' },
      { name: 'Designer Lamp', category: 'Lighting', price: '€149', link: '#' },
      { name: 'Decorative Cushions', category: 'Accessories', price: '€39', link: '#' },
      { name: 'Area Rug', category: 'Textiles', price: '€199', link: '#' },
      { name: 'Wall Art', category: 'Decor', price: '€79', link: '#' }
    ];

    // Save design to database
    const { data: designData, error: designError } = await supabase
      .from('home_designs')
      .insert({
        user_id: user.id,
        original_image_url: originalImageUrl,
        redesigned_image_url: redesignedImageUrl,
        room_type: roomType,
        style_preference: stylePreference,
        design_prompt: designPrompt,
        product_suggestions: productSuggestions,
        credits_used: 10
      })
      .select()
      .single();

    if (designError) {
      console.error('Error saving design:', designError);
      return new Response(JSON.stringify({ error: 'Failed to save design' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Deduct credits
    await supabase
      .from('ai_credits')
      .update({ 
        credits_remaining: creditsData.credits_remaining - 10,
        last_used_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    // Log usage
    await supabase
      .from('ai_usage_history')
      .insert({
        user_id: user.id,
        usage_type: 'home_design',
        credits_used: 10,
        description: `Generated ${stylePreference} design for ${roomType}`
      });

    return new Response(JSON.stringify({ 
      success: true,
      design: designData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-home-design:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});