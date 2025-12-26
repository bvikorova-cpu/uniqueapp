import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { 
      workoutType, 
      goal, 
      experienceLevel, 
      daysPerWeek,
      sessionDuration,
      equipment
    } = await req.json();

    console.log('Generating workout plan for user:', user.id, workoutType);

    // Check AI credits
    const creditsNeeded = 30;
    const { data: credits } = await supabaseClient
      .from('ai_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .single();

    if (!credits || credits.credits_remaining < creditsNeeded) {
      return new Response(JSON.stringify({ error: 'Insufficient AI credits. You need 30 credits to generate a workout plan.' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate with OpenAI
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    
    const prompt = `Create a personalized workout plan based on these parameters:
- Workout Type: ${workoutType}
- Goal: ${goal}
- Experience Level: ${experienceLevel}
- Days per Week: ${daysPerWeek}
- Session Duration: ${sessionDuration} minutes
- Available Equipment: ${equipment || 'bodyweight only'}

Generate a comprehensive plan including:
1. Weekly schedule with specific exercises
2. Sets and reps for each exercise
3. Rest periods
4. Progression plan
5. Nutrition recommendations (calories and macros)
6. Meal suggestions that match the workout intensity

Return ONLY valid JSON with this structure:
{
  "planName": "descriptive plan name",
  "description": "brief overview",
  "weeklySchedule": [
    {
      "day": "Monday",
      "focus": "Upper Body",
      "exercises": [
        {
          "name": "Push-ups",
          "sets": 3,
          "reps": "10-12",
          "rest": "60 seconds",
          "notes": "optional technique tips"
        }
      ]
    }
  ],
  "nutrition": {
    "dailyCalories": 2200,
    "protein": 150,
    "carbs": 220,
    "fats": 70,
    "mealTiming": "pre/post workout timing tips"
  },
  "mealSuggestions": [
    {
      "meal": "Pre-Workout",
      "foods": ["banana", "oatmeal"],
      "timing": "1-2 hours before"
    }
  ],
  "progressionPlan": "how to progress over weeks",
  "tips": ["tip 1", "tip 2"]
}`;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      return new Response(JSON.stringify({ error: 'AI generation failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;

    // Parse JSON response
    let workoutData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        workoutData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      workoutData = {
        planName: `${workoutType} Plan`,
        description: content.substring(0, 200),
        weeklySchedule: [],
        nutrition: {
          dailyCalories: 2000,
          protein: 150,
          carbs: 200,
          fats: 65
        },
        mealSuggestions: [],
        progressionPlan: 'Increase intensity gradually',
        tips: []
      };
    }

    // Save to database
    const { data: workoutPlan, error: saveError } = await supabaseClient
      .from('workout_plans')
      .insert({
        user_id: user.id,
        workout_type: workoutType,
        goal: goal,
        experience_level: experienceLevel,
        days_per_week: daysPerWeek,
        session_duration: sessionDuration,
        plan_data: workoutData,
        nutrition_data: workoutData.nutrition
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving plan:', saveError);
      throw saveError;
    }

    // Deduct AI credits
    await supabaseClient
      .from('ai_credits')
      .update({ 
        credits_remaining: credits.credits_remaining - creditsNeeded,
        last_used_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    // Log AI usage
    await supabaseClient
      .from('ai_usage_history')
      .insert({
        user_id: user.id,
        usage_type: 'workout_plan',
        credits_used: creditsNeeded,
        description: `Generated ${workoutType} plan`
      });

    console.log('Workout plan generated:', workoutPlan.id);

    return new Response(JSON.stringify({ plan: workoutData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-workout-plan function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
