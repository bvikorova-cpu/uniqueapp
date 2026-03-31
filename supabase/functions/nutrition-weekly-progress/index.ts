import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) throw new Error('Unauthorized');

    const { avg_daily_calories, avg_daily_protein, workouts_per_week, current_weight } = await req.json();

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) throw new Error('OpenAI API key not configured');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: `You are a fitness analytics AI. Generate a detailed weekly progress report with chart data. Return JSON:
{
  "overall_score": number(0-100),
  "nutrition_grade": "A+/A/B+/B/C/D",
  "weight_trend": "Losing/Gaining/Stable",
  "consistency_percent": number(0-100),
  "daily_calories_chart": [{"day": "Mon", "calories": number}, ...for 7 days],
  "macro_distribution": [{"name": "Protein", "value": number}, {"name": "Carbs", "value": number}, {"name": "Fat", "value": number}],
  "weight_projection": [{"week": "Week 1", "weight": number}, ...for 4 weeks],
  "insights": ["string" x 4],
  "action_plan": ["string" x 4]
}` },
          { role: 'user', content: `Avg daily calories: ${avg_daily_calories}\nAvg daily protein: ${avg_daily_protein}g\nWorkouts/week: ${workouts_per_week}\nCurrent weight: ${current_weight}kg\n\nGenerate weekly progress report.` }
        ],
        temperature: 0.5,
        response_format: { type: "json_object" }
      })
    });

    const aiData = await response.json();
    const report = JSON.parse(aiData.choices[0].message.content);

    return new Response(JSON.stringify({ report }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
