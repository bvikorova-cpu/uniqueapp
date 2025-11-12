import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Brain Duel Matchmaking function started');

Deno.serve(async (req) => {
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

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { category } = await req.json();
    console.log('Finding match for user:', user.id, 'category:', category);

    // Check if user has enough credits (10 credits per game)
    const { data: creditsData } = await supabaseClient
      .from('brain_duel_credits')
      .select('credits')
      .eq('user_id', user.id)
      .single();

    if (!creditsData || creditsData.credits < 10) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits. You need 10 credits to play.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Try to find an existing waiting match
    const { data: waitingMatches } = await supabaseClient
      .from('brain_duel_matches')
      .select('*')
      .eq('status', 'waiting')
      .eq('category', category)
      .neq('player1_id', user.id)
      .limit(1);

    let match;

    if (waitingMatches && waitingMatches.length > 0) {
      // Join existing match
      const waitingMatch = waitingMatches[0];
      
      const { data: updatedMatch, error: updateError } = await supabaseClient
        .from('brain_duel_matches')
        .update({
          player2_id: user.id,
          status: 'ready',
          started_at: new Date().toISOString(),
        })
        .eq('id', waitingMatch.id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      // Deduct credits from both players
      await supabaseClient.rpc('spend_brain_duel_credits', { 
        p_user_id: user.id,
        p_amount: 10 
      });
      
      await supabaseClient.rpc('spend_brain_duel_credits', { 
        p_user_id: waitingMatch.player1_id,
        p_amount: 10 
      });

      match = updatedMatch;
      console.log('Joined existing match:', match.id);
    } else {
      // Create new match
      const { data: newMatch, error: createError } = await supabaseClient
        .from('brain_duel_matches')
        .insert({
          player1_id: user.id,
          category,
          status: 'waiting',
        })
        .select()
        .single();

      if (createError) throw createError;
      
      match = newMatch;
      console.log('Created new match:', match.id);
    }

    return new Response(
      JSON.stringify({ match }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in matchmaking:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
