import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const aiResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: `Generate a collectible item image: ${prompt}. Make it unique and visually appealing for a digital collection.`,
        n: 1,
        size: '1024x1024',
        quality: 'high',
        output_format: 'webp',
        output_compression: 90,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error('Failed to generate collectible image');
    }

    const aiData = await aiResponse.json();
    const base64Image = aiData.data?.[0]?.b64_json;

    if (!base64Image) {
      throw new Error('No image generated');
    }

    const imageUrl = `data:image/webp;base64,${base64Image}`;

    const { data: rarity } = await supabaseClient
      .from('collectible_rarities')
      .select('*')
      .eq('level', rarityLevel || 1)
      .single();

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

    await supabaseClient.rpc('decrement_ai_credits', {
      user_id: user.id,
      amount: 10
    });

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
