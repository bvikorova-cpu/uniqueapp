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

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );

  try {
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { userBoxId } = await req.json();

    // Get the user's box
    const { data: userBox, error: boxError } = await supabaseClient
      .from('user_mystery_boxes')
      .select('*, mystery_boxes(*)')
      .eq('id', userBoxId)
      .eq('user_id', user.id)
      .eq('is_opened', false)
      .single();

    if (boxError || !userBox) {
      throw new Error('Box not found or already opened');
    }

    // Get all possible items for this box
    const { data: possibleItems, error: itemsError } = await supabaseClient
      .from('mystery_box_items')
      .select('*')
      .eq('box_id', userBox.box_id);

    if (itemsError || !possibleItems || possibleItems.length === 0) {
      throw new Error('No items available in this box');
    }

    // Weighted random selection based on drop_chance
    const totalWeight = possibleItems.reduce((sum, item) => sum + Number(item.drop_chance), 0);
    let random = Math.random() * totalWeight;
    
    let selectedItem = possibleItems[0];
    for (const item of possibleItems) {
      random -= Number(item.drop_chance);
      if (random <= 0) {
        selectedItem = item;
        break;
      }
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + selectedItem.duration_days);

    // Create reward record
    const { data: reward, error: rewardError } = await supabaseClient
      .from('mystery_box_rewards')
      .insert({
        user_id: user.id,
        user_box_id: userBoxId,
        item_id: selectedItem.id,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (rewardError) {
      throw new Error('Failed to create reward');
    }

    // Mark box as opened
    const { error: updateError } = await supabaseClient
      .from('user_mystery_boxes')
      .update({
        is_opened: true,
        opened_at: new Date().toISOString(),
      })
      .eq('id', userBoxId);

    if (updateError) {
      throw new Error('Failed to update box status');
    }

    return new Response(
      JSON.stringify({
        success: true,
        reward: {
          ...selectedItem,
          expiresAt: expiresAt.toISOString(),
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error opening mystery box:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});