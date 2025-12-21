import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { isPremium } = await req.json();
    
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    // Get last 7 days of entries
    const { data: entries, error: entriesError } = await supabase
      .from('routine_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
      .limit(7);

    if (entriesError) throw entriesError;

    if (!entries || entries.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Not enough data. Track your routine for at least a few days first.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare data for AI analysis
    const routineData = entries.map(e => ({
      date: e.entry_date,
      sleep: e.sleep_hours,
      workout: e.workout_minutes,
      work: e.work_hours,
      social: e.social_hours,
      energy: e.energy_level,
      mood: e.mood_score,
      notes: e.notes
    }));

    const prompt = `Analyzuj túto 7-dňovú rutinu a poskytni optimalizácie:
${JSON.stringify(routineData, null, 2)}

Poskytni:
1. Sleep recommendation (ideálne hodiny, čas ísť spať)
2. Workout recommendation (frekvencia, intenzita)
3. Work recommendation (produktivita, pauzy)
4. Social recommendation (work-life balance)
5. Habit stacking suggestions (3-5 konkrétnych návrhov ako spojiť návyky)
6. Energy insights (vzory, kedy má najviac energie)
7. Balance score (0-100)

${isPremium ? 'Premium analýza: Buď veľmi detailný, zohľadni všetky nuansy a poskytni pokročilé insights.' : 'Basic analýza: Poskytni základné odporúčania.'}

Odpovedaj po slovensky, jasne a prakticky.`;

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) throw new Error('OPENAI_API_KEY not configured');

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'Si expert na optimalizáciu životnej rutiny, spánok, produktivitu a wellness. Poskytuj konkrétne, praktické rady.'
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI API error:', aiResponse.status, await aiResponse.text());
      throw new Error('AI analysis failed');
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices[0].message.content;

    // Parse AI response (simplified - you may want more robust parsing)
    const optimization = {
      sleep_recommendation: extractSection(analysis, 'Sleep recommendation'),
      workout_recommendation: extractSection(analysis, 'Workout recommendation'),
      work_recommendation: extractSection(analysis, 'Work recommendation'),
      social_recommendation: extractSection(analysis, 'Social recommendation'),
      habit_stacking_suggestions: extractHabits(analysis),
      energy_insights: extractSection(analysis, 'Energy insights'),
      balance_score: extractScore(analysis),
      optimization_data: { full_analysis: analysis },
      is_premium: isPremium
    };

    // Save optimization
    const { data: saved, error: saveError } = await supabase
      .from('ai_routine_optimizations')
      .insert({
        user_id: user.id,
        ...optimization
      })
      .select()
      .single();

    if (saveError) throw saveError;

    return new Response(
      JSON.stringify({ success: true, optimization: saved }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in optimize-routine:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractSection(text: string, sectionName: string): string {
  const regex = new RegExp(`${sectionName}:?\\s*(.+?)(?=\\n\\n|\\d+\\.|$)`, 'is');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}

function extractHabits(text: string): any[] {
  const habitsMatch = text.match(/Habit stacking suggestions:?\s*(.+?)(?=\n\n|\d+\.|$)/is);
  if (!habitsMatch) return [];
  
  const habits = habitsMatch[1]
    .split('\n')
    .filter(line => line.trim() && (line.includes('-') || line.includes('•')))
    .map(line => ({ suggestion: line.replace(/^[-•]\s*/, '').trim() }));
  
  return habits;
}

function extractScore(text: string): number {
  const scoreMatch = text.match(/Balance score:?\s*(\d+)/i);
  return scoreMatch ? parseInt(scoreMatch[1]) : 70;
}