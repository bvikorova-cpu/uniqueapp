import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user has enough cooking credits (5 credits for meal plan)
    const { data: credits } = await supabase
      .from('cooking_credits')
      .select('credits')
      .eq('user_id', user.id)
      .single();

    if (!credits || credits.credits < 5) {
      return new Response(JSON.stringify({ error: 'Insufficient credits (5 required)' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { days, dietary_preferences, calorie_target } = await req.json();
    console.log('Generating meal plan:', { days, dietary_preferences, calorie_target });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const prompt = `Generate a ${days}-day meal plan.
${dietary_preferences?.length > 0 ? `Diet preferences: ${dietary_preferences.join(', ')}.` : ''}
${calorie_target ? `Calorie target: ${calorie_target} kcal/day.` : ''}

Return JSON:
{
  "meal_plan": {
    "days": [
      {
        "day": 1,
        "date": "2025-01-20",
        "meals": {
          "breakfast": { "name": "Breakfast", "calories": 400, "ingredients": [] },
          "lunch": { "name": "Lunch", "calories": 600, "ingredients": [] },
          "dinner": { "name": "Dinner", "calories": 500, "ingredients": [] },
          "snacks": [{ "name": "Snack", "calories": 150, "ingredients": [] }]
        },
        "total_calories": 1650
      }
    ]
  },
  "shopping_list": {
    "categories": {
      "vegetables": ["carrots", "tomatoes"],
      "proteins": ["chicken"],
      "grains": ["rice"],
      "dairy": ["yogurt"],
      "other": ["olive oil"]
    }
  },
  "weekly_summary": {
    "total_calories": 11550,
    "average_calories_per_day": 1650,
    "protein_grams": 500,
    "carbs_grams": 800,
    "fats_grams": 300
  }
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    let mealPlanData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      mealPlanData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      mealPlanData = {};
    }

    // Save to database
    const { data: savedPlan } = await supabase
      .from('meal_plans_ai')
      .insert({
        user_id: user.id,
        plan_name: `${days}-day plan`,
        days_count: days,
        meals: mealPlanData.meal_plan || {},
        shopping_list: mealPlanData.shopping_list || {},
        total_calories: mealPlanData.weekly_summary?.total_calories || 0,
        dietary_preferences,
        credits_used: 5
      })
      .select()
      .single();

    // Deduct 5 cooking credits
    await supabase
      .from('cooking_credits')
      .update({ credits: credits.credits - 5 })
      .eq('user_id', user.id);

    console.log('Meal plan generated successfully');

    return new Response(JSON.stringify({ 
      meal_plan: mealPlanData,
      plan_id: savedPlan.id,
      credits_remaining: credits.credits - 5
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-weekly-meal-plan:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});