import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { boxId } = await req.json();

    const { data: box } = await supabaseClient
      .from('mystery_boxes')
      .select('*')
      .eq('id', boxId)
      .single();

    if (!box) throw new Error('Box not found');

    const { data: credits } = await supabaseClient
      .from('ai_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .single();

    if (!credits || credits.credits_remaining < box.cost) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: rarities } = await supabaseClient
      .from('collectible_rarities')
      .select('*')
      .gte('level', box.min_rarity_level)
      .lte('level', box.max_rarity_level);

    if (!rarities || rarities.length === 0) throw new Error('No rarities found');

    const random = Math.random() * 100;
    let cumulative = 0;
    let selectedRarity = rarities[0];

    for (const rarity of rarities) {
      cumulative += Number(rarity.drop_rate);
      if (random <= cumulative) {
        selectedRarity = rarity;
        break;
      }
    }

    const { data: collectibles } = await supabaseClient
      .from('collectibles')
      .select('*')
      .eq('rarity_id', selectedRarity.id)
      .eq('is_active', true);

    if (!collectibles || collectibles.length === 0) throw new Error('No collectibles found');

    const randomCollectible = collectibles[Math.floor(Math.random() * collectibles.length)];

    const { data: userCollectible } = await supabaseClient
      .from('user_collectibles')
      .insert({
        user_id: user.id,
        collectible_id: randomCollectible.id,
        acquired_method: 'mystery_box'
      })
      .select()
      .single();

    await supabaseClient.rpc('decrement_ai_credits', {
      user_id: user.id,
      amount: box.cost
    });

    return new Response(
      JSON.stringify({ userCollectible, rarity: selectedRarity }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});