import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Brain Duel Submit Answer function started');

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

    const { match_id, question_id, answer } = await req.json();
    console.log('Submitting answer for match:', match_id, 'question:', question_id);

    // Get the correct answer
    const { data: question } = await supabaseClient
      .from('brain_duel_questions')
      .select('correct_answer')
      .eq('id', question_id)
      .single();

    if (!question) throw new Error('Question not found');

    const isCorrect = question.correct_answer === answer;

    // Record the answer
    await supabaseClient
      .from('brain_duel_answers')
      .insert({
        match_id,
        question_id,
        player_id: user.id,
        answer,
        is_correct: isCorrect,
      });

    // Update match score
    const { data: match } = await supabaseClient
      .from('brain_duel_matches')
      .select('*')
      .eq('id', match_id)
      .single();

    if (!match) throw new Error('Match not found');

    const isPlayer1 = match.player1_id === user.id;
    const scoreField = isPlayer1 ? 'player1_score' : 'player2_score';
    const newScore = isCorrect ? (match[scoreField] + 1) : match[scoreField];

    await supabaseClient
      .from('brain_duel_matches')
      .update({ [scoreField]: newScore })
      .eq('id', match_id);

    return new Response(
      JSON.stringify({ 
        is_correct: isCorrect,
        correct_answer: question.correct_answer,
        new_score: newScore
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error submitting answer:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
