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

    // Verify user is part of this match and get match details
    const { data: match } = await supabaseClient
      .from('brain_duel_matches')
      .select('*')
      .eq('id', match_id)
      .single();

    if (!match || (match.player1_id !== user.id && match.player2_id !== user.id)) {
      throw new Error('Not authorized for this match');
    }

    // Get the number of questions based on game mode
    const questionCount = match.total_questions || 10;
    const timePerQuestion = match.time_per_question || 30;

    // Check if user has purchased question packs for this category
    const { data: userPacks } = await supabaseClient
      .from('brain_duel_user_packs')
      .select('pack_id, brain_duel_question_packs!inner(category)')
      .eq('user_id', user.id);

    // Get questions - include questions from purchased packs
    let query = supabaseClient
      .from('brain_duel_questions')
      .select('id, category, question, option_a, option_b, option_c, option_d, difficulty');

    // Filter by category if not "mixed"
    if (category && category !== 'mixed') {
      query = query.eq('category', category);
    }

    const { data: questions, error: questionsError } = await query.limit(questionCount * 3); // Get more for shuffling

    if (questionsError) throw questionsError;

    if (!questions || questions.length === 0) {
      // Return sample questions if no questions in database
      const sampleQuestions = generateSampleQuestions(category, questionCount);
      return new Response(
        JSON.stringify({ 
          questions: sampleQuestions,
          timePerQuestion,
          totalQuestions: questionCount
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Shuffle and limit questions
    const shuffledQuestions = questions
      .sort(() => Math.random() - 0.5)
      .slice(0, questionCount);

    return new Response(
      JSON.stringify({ 
        questions: shuffledQuestions,
        timePerQuestion,
        totalQuestions: questionCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error getting questions:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});

// Generate sample questions for testing
function generateSampleQuestions(category: string, count: number) {
  const questions = [
    {
      id: 'sample-1',
      category: category || 'Geography',
      question: 'What is the capital of France?',
      option_a: 'London',
      option_b: 'Paris',
      option_c: 'Berlin',
      option_d: 'Madrid',
      correct_answer: 'b',
      difficulty: 'easy'
    },
    {
      id: 'sample-2',
      category: category || 'Science',
      question: 'What is the chemical symbol for water?',
      option_a: 'H2O',
      option_b: 'CO2',
      option_c: 'NaCl',
      option_d: 'O2',
      correct_answer: 'a',
      difficulty: 'easy'
    },
    {
      id: 'sample-3',
      category: category || 'History',
      question: 'In which year did World War II end?',
      option_a: '1943',
      option_b: '1944',
      option_c: '1945',
      option_d: '1946',
      correct_answer: 'c',
      difficulty: 'medium'
    },
    {
      id: 'sample-4',
      category: category || 'Geography',
      question: 'Which is the largest ocean on Earth?',
      option_a: 'Atlantic Ocean',
      option_b: 'Indian Ocean',
      option_c: 'Arctic Ocean',
      option_d: 'Pacific Ocean',
      correct_answer: 'd',
      difficulty: 'easy'
    },
    {
      id: 'sample-5',
      category: category || 'Science',
      question: 'What planet is known as the Red Planet?',
      option_a: 'Venus',
      option_b: 'Mars',
      option_c: 'Jupiter',
      option_d: 'Saturn',
      correct_answer: 'b',
      difficulty: 'easy'
    },
    {
      id: 'sample-6',
      category: category || 'History',
      question: 'Who painted the Mona Lisa?',
      option_a: 'Michelangelo',
      option_b: 'Raphael',
      option_c: 'Leonardo da Vinci',
      option_d: 'Donatello',
      correct_answer: 'c',
      difficulty: 'medium'
    },
    {
      id: 'sample-7',
      category: category || 'Science',
      question: 'What is the hardest natural substance on Earth?',
      option_a: 'Gold',
      option_b: 'Iron',
      option_c: 'Diamond',
      option_d: 'Platinum',
      correct_answer: 'c',
      difficulty: 'easy'
    },
    {
      id: 'sample-8',
      category: category || 'Geography',
      question: 'Which country has the largest population?',
      option_a: 'USA',
      option_b: 'India',
      option_c: 'China',
      option_d: 'Indonesia',
      correct_answer: 'b',
      difficulty: 'medium'
    },
    {
      id: 'sample-9',
      category: category || 'History',
      question: 'Which ancient wonder was located in Egypt?',
      option_a: 'Hanging Gardens',
      option_b: 'Colossus of Rhodes',
      option_c: 'Great Pyramid of Giza',
      option_d: 'Temple of Artemis',
      correct_answer: 'c',
      difficulty: 'easy'
    },
    {
      id: 'sample-10',
      category: category || 'Science',
      question: 'What gas do plants absorb from the atmosphere?',
      option_a: 'Oxygen',
      option_b: 'Nitrogen',
      option_c: 'Carbon Dioxide',
      option_d: 'Hydrogen',
      correct_answer: 'c',
      difficulty: 'easy'
    }
  ];

  return questions.slice(0, count);
}
