import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Brain Duel Get Questions function started');

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

    const { match_id, category } = await req.json();
    console.log('Getting questions for match:', match_id, 'category:', category);

    // Verify user is part of this match
    const { data: match } = await supabaseClient
      .from('brain_duel_matches')
      .select('*')
      .eq('id', match_id)
      .single();

    if (!match || (match.player1_id !== user.id && match.player2_id !== user.id)) {
      throw new Error('Not authorized for this match');
    }

    // Get random questions from the category
    const { data: questions, error: questionsError } = await supabaseClient
      .from('brain_duel_questions')
      .select('id, category, question, option_a, option_b, option_c, option_d')
      .eq('category', category)
      .limit(10);

    if (questionsError) throw questionsError;

    // Shuffle questions
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5);

    return new Response(
      JSON.stringify({ questions: shuffledQuestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error getting questions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
