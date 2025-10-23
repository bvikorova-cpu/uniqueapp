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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { prompt, categoryId, rarityLevel } = await req.json();

    // Check AI credits
    const { data: credits } = await supabaseClient
      .from('ai_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .single();

    if (!credits || credits.credits_remaining < 10) {
      return new Response(
        JSON.stringify({ error: 'Insufficient AI credits' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate image using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

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
            content: `Generate a collectible item image: ${prompt}. Make it unique and visually appealing for a digital collection.`
          }
        ],
        modalities: ['image', 'text']
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI generation error:', errorText);
      throw new Error('Failed to generate collectible image');
    }

    const aiData = await aiResponse.json();
    const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error('No image generated');
    }

    // Get rarity
    const { data: rarity } = await supabaseClient
      .from('collectible_rarities')
      .select('*')
      .eq('level', rarityLevel || 1)
      .single();

    // Create collectible template
    const { data: collectible, error: collectibleError } = await supabaseClient
      .from('collectibles')
      .insert({
        name: prompt.substring(0, 50),
        description: `AI-generated collectible: ${prompt}`,
        image_url: imageUrl,
        category_id: categoryId,
        rarity_id: rarity.id,
        generation_cost: 10
      })
      .select()
      .single();

    if (collectibleError) throw collectibleError;

    // Create user collectible
    const { data: userCollectible, error: userCollectibleError } = await supabaseClient
      .from('user_collectibles')
      .insert({
        user_id: user.id,
        collectible_id: collectible.id,
        acquired_method: 'generated'
      })
      .select()
      .single();

    if (userCollectibleError) throw userCollectibleError;

    // Deduct credits
    await supabaseClient.rpc('decrement_ai_credits', {
      user_id: user.id,
      amount: 10
    });

    // Log usage
    await supabaseClient.from('ai_usage_history').insert({
      user_id: user.id,
      usage_type: 'collectible_generation',
      credits_used: 10,
      description: `Generated: ${prompt}`
    });

    return new Response(
      JSON.stringify({ collectible, userCollectible }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Generate collectible error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});