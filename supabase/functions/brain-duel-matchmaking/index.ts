import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Brain Duel Matchmaking function started');

// Game mode configurations
const GAME_MODES = {
  quick: { questions: 10, timePerQuestion: 30, entryCost: 10, winReward: 20 },
  classic: { questions: 20, timePerQuestion: 30, entryCost: 20, winReward: 50 },
  championship: { questions: 50, timePerQuestion: 24, entryCost: 50, winReward: 150 },
};

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

    const { category, gameMode = 'quick', league } = await req.json();
    console.log('Finding match for user:', user.id, 'category:', category, 'mode:', gameMode, 'league:', league);

    // Get game mode config
    const modeConfig = GAME_MODES[gameMode as keyof typeof GAME_MODES] || GAME_MODES.quick;
    const entryCost = modeConfig.entryCost;

    // Check if user has enough credits
    const { data: creditsData } = await supabaseClient
      .from('brain_duel_credits')
      .select('credits')
      .eq('user_id', user.id)
      .single();

    if (!creditsData || creditsData.credits < entryCost) {
      return new Response(
        JSON.stringify({ error: `Insufficient credits. You need ${entryCost} credits to play ${gameMode} mode.` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Try to find an existing waiting match with same mode and category
    let query = supabaseClient
      .from('brain_duel_matches')
      .select('*')
      .eq('status', 'waiting')
      .eq('category', category)
      .eq('game_mode', gameMode)
      .neq('player1_id', user.id);

    // Filter by league if specified
    if (league) {
      query = query.eq('league', league);
    }

    const { data: waitingMatches } = await query.limit(1);

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
      
      // Deduct credits from joining player
      await supabaseClient
        .from('brain_duel_credits')
        .update({ credits: creditsData.credits - entryCost })
        .eq('user_id', user.id);

      match = updatedMatch;
      console.log('Joined existing match:', match.id);
    } else {
      // Create new match with game mode settings
      const { data: newMatch, error: createError } = await supabaseClient
        .from('brain_duel_matches')
        .insert({
          player1_id: user.id,
          category,
          status: 'waiting',
          game_mode: gameMode,
          total_questions: modeConfig.questions,
          time_per_question: modeConfig.timePerQuestion,
          entry_cost: modeConfig.entryCost,
          win_reward: modeConfig.winReward,
          league: league || null,
          is_spectatable: true,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Deduct credits from creating player
      await supabaseClient
        .from('brain_duel_credits')
        .update({ credits: creditsData.credits - entryCost })
        .eq('user_id', user.id);
      
      match = newMatch;
      console.log('Created new match:', match.id);
    }

    return new Response(
      JSON.stringify({ 
        match,
        gameConfig: modeConfig
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in matchmaking:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
