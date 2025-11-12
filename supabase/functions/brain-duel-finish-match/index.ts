import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Brain Duel Finish Match function started');

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

    const { match_id } = await req.json();
    console.log('Finishing match:', match_id);

    // Get match data
    const { data: match } = await supabaseClient
      .from('brain_duel_matches')
      .select('*')
      .eq('id', match_id)
      .single();

    if (!match) throw new Error('Match not found');

    // Determine winner
    let winnerId = null;
    if (match.player1_score > match.player2_score) {
      winnerId = match.player1_id;
    } else if (match.player2_score > match.player1_score) {
      winnerId = match.player2_id;
    }

    // Award credits to winner (20 credits)
    if (winnerId) {
      const { data: winnerCredits } = await supabaseClient
        .from('brain_duel_credits')
        .select('credits')
        .eq('user_id', winnerId)
        .single();

      if (winnerCredits) {
        await supabaseClient
          .from('brain_duel_credits')
          .update({ credits: winnerCredits.credits + 20 })
          .eq('user_id', winnerId);
      }
    }

    // Update match status
    const { error: updateError } = await supabaseClient
      .from('brain_duel_matches')
      .update({
        status: 'finished',
        winner_id: winnerId,
        finished_at: new Date().toISOString(),
      })
      .eq('id', match_id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ 
        winner_id: winnerId,
        player1_score: match.player1_score,
        player2_score: match.player2_score,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error finishing match:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
