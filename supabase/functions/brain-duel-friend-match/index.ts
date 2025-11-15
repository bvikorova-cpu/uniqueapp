import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Brain Duel Friend Match function started');

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

    const { challenge_id } = await req.json();
    console.log('Starting friend match for challenge:', challenge_id);

    // Get challenge details
    const { data: challenge, error: challengeError } = await supabaseClient
      .from('brain_duel_friend_challenges')
      .select('*')
      .eq('id', challenge_id)
      .single();

    if (challengeError || !challenge) {
      throw new Error('Challenge not found');
    }

    // Verify user is part of this challenge
    if (user.id !== challenge.challenger_id && user.id !== challenge.challenged_id) {
      throw new Error('Unauthorized to start this match');
    }

    // Check if both users have enough credits
    const { data: challengerCredits } = await supabaseClient
      .from('brain_duel_credits')
      .select('credits')
      .eq('user_id', challenge.challenger_id)
      .single();

    const { data: challengedCredits } = await supabaseClient
      .from('brain_duel_credits')
      .select('credits')
      .eq('user_id', challenge.challenged_id)
      .single();

    const stakeAmount = challenge.stake_credits || 10;

    if (!challengerCredits || challengerCredits.credits < stakeAmount) {
      throw new Error('Challenger has insufficient credits');
    }

    if (!challengedCredits || challengedCredits.credits < stakeAmount) {
      throw new Error('Challenged player has insufficient credits');
    }

    // Deduct credits from both players
    await supabaseClient.rpc('spend_brain_duel_credits', { 
      p_user_id: challenge.challenger_id,
      p_amount: stakeAmount
    });
    
    await supabaseClient.rpc('spend_brain_duel_credits', { 
      p_user_id: challenge.challenged_id,
      p_amount: stakeAmount
    });

    // Create the match
    const { data: newMatch, error: createError } = await supabaseClient
      .from('brain_duel_matches')
      .insert({
        player1_id: challenge.challenger_id,
        player2_id: challenge.challenged_id,
        category: challenge.category,
        status: 'ready',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) throw createError;

    // Update challenge status with match_id
    await supabaseClient
      .from('brain_duel_friend_challenges')
      .update({ 
        status: 'active',
        match_id: newMatch.id,
        accepted_at: new Date().toISOString()
      })
      .eq('id', challenge_id);

    console.log('Friend match created:', newMatch.id);

    return new Response(
      JSON.stringify({ 
        match: newMatch,
        stake_amount: stakeAmount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in friend match:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
