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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user has enough AI credits (50 credits for meal plan)
    const { data: credits } = await supabase
      .from('ai_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .single();

    if (!credits || credits.credits_remaining < 50) {
      return new Response(JSON.stringify({ error: 'Nedostatok AI kreditov (potrebných 50)' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { days, dietary_preferences, calorie_target } = await req.json();
    console.log('Generating meal plan:', { days, dietary_preferences, calorie_target });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const prompt = `Vygeneruj ${days}-dňový jedálny plán.
${dietary_preferences ? `Diéta: ${dietary_preferences.join(', ')}.` : ''}
${calorie_target ? `Cieľ kalórií: ${calorie_target} kcal/deň.` : ''}

Vráť JSON:
{
  "meal_plan": {
    "days": [
      {
        "day": 1,
        "date": "2025-01-20",
        "meals": {
          "breakfast": { "name": "Raňajky", "calories": 400, "ingredients": [] },
          "lunch": { "name": "Obed", "calories": 600, "ingredients": [] },
          "dinner": { "name": "Večera", "calories": 500, "ingredients": [] },
          "snacks": [{ "name": "Snack", "calories": 150, "ingredients": [] }]
        },
        "total_calories": 1650
      }
    ]
  },
  "shopping_list": {
    "categories": {
      "vegetables": ["mrkva", "paradajky"],
      "proteins": ["kuracie mäso"],
      "grains": ["ryža"],
      "dairy": ["jogurt"],
      "other": ["olivový olej"]
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
        plan_name: `${days}-dňový plán`,
        days_count: days,
        meals: mealPlanData.meal_plan || {},
        shopping_list: mealPlanData.shopping_list || {},
        total_calories: mealPlanData.weekly_summary?.total_calories || 0,
        dietary_preferences,
        credits_used: 50
      })
      .select()
      .single();

    // Deduct 50 AI credits and log usage
    await supabase
      .from('ai_credits')
      .update({ 
        credits_remaining: credits.credits_remaining - 50,
        last_used_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    await supabase
      .from('ai_usage_history')
      .insert({
        user_id: user.id,
        usage_type: 'meal_plan_generation',
        credits_used: 50,
        description: `Generated ${days}-day meal plan`
      });

    console.log('Meal plan generated successfully');

    return new Response(JSON.stringify({ 
      meal_plan: mealPlanData,
      plan_id: savedPlan.id,
      credits_remaining: credits.credits_remaining - 50
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