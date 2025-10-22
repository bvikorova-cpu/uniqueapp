import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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
      throw new Error('Not authenticated');
    }

    const { imageUrl, restorationType } = await req.json();
    console.log('Restoring photo:', { imageUrl, restorationType, userId: user.id });

    // Check user credits
    const { data: creditsData, error: creditsError } = await supabaseClient
      .from('photo_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .maybeSingle();

    if (creditsError) {
      console.error('Error fetching credits:', creditsError);
      throw new Error('Failed to check credits');
    }

    if (!creditsData || creditsData.credits_remaining < 1) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits. Please purchase more credits.' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare AI prompt based on restoration type
    let prompt = '';
    switch (restorationType) {
      case 'colorize':
        prompt = 'Transform this black and white photo into a natural, realistic colored image. Add appropriate colors based on the historical context and typical colors of the era. Maintain all original details and quality.';
        break;
      case 'repair':
        prompt = 'Repair and restore this damaged photo. Remove scratches, tears, stains, and other imperfections. Reconstruct missing parts naturally. Enhance clarity while preserving the authentic vintage character.';
        break;
      case 'enhance':
        prompt = 'Enhance this photo by improving sharpness, clarity, and overall quality. Reduce noise and grain. Adjust brightness and contrast for optimal viewing. Preserve the original character and authenticity.';
        break;
      default:
        prompt = 'Restore and enhance this old photo. Repair any damage, improve quality, and colorize if it\'s black and white.';
    }

    // Call Lovable AI Gateway for image editing
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Calling AI Gateway for restoration...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service credits exhausted. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const restoredImageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!restoredImageUrl) {
      console.error('No image in AI response:', JSON.stringify(aiData));
      throw new Error('Failed to generate restored image');
    }

    console.log('Image restored successfully');

    // Deduct credit
    const { error: updateError } = await supabaseClient
      .from('photo_credits')
      .update({ 
        credits_remaining: creditsData.credits_remaining - 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating credits:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        restoredImageUrl,
        creditsRemaining: creditsData.credits_remaining - 1
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in restore-old-photo:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
