import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

    const { title, days, targetCalories, targetProtein, targetCarbs, targetFats, dietaryPreferences, allergens, isPremium } = await req.json();

    console.log('Generating meal plan for user:', user.id);

    // Check and deduct AI credits (meal plans cost 50 credits)
    const creditsNeeded = 50;

    const { data: creditData, error: creditError } = await supabaseClient
      .from('ai_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .single();

    if (creditError || !creditData || creditData.credits_remaining < creditsNeeded) {
      return new Response(JSON.stringify({ error: `Insufficient credits. You need ${creditsNeeded} AI credits.` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Deduct credits
    const { error: deductError } = await supabaseClient
      .from('ai_credits')
      .update({ 
        credits_remaining: creditData.credits_remaining - creditsNeeded,
        last_used_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (deductError) {
      console.error('Error deducting credits:', deductError);
      return new Response(JSON.stringify({ error: 'Error processing credits' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log usage
    await supabaseClient
      .from('ai_usage_history')
      .insert({
        user_id: user.id,
        usage_type: 'meal_plan',
        credits_used: creditsNeeded,
        description: `Generated ${days}-day meal plan: ${title}`
      });

    const dietaryInfo = dietaryPreferences?.length ? `Dietary preferences: ${dietaryPreferences.join(', ')}. ` : '';
    const allergenInfo = allergens?.length ? `Allergens to avoid: ${allergens.join(', ')}. ` : '';
    const macroInfo = targetProtein ? `Target macros: ${targetProtein}g protein, ${targetCarbs}g carbs, ${targetFats}g fats. ` : '';

    const prompt = `Create a detailed ${days}-day meal plan with approximately ${targetCalories} calories per day. ${dietaryInfo}${allergenInfo}${macroInfo}

For each day, provide breakfast, lunch, dinner, and 2 snacks. For each meal include:
- Name of the dish
- Ingredients list
- Calories
- Protein (g), Carbs (g), Fats (g)
- Simple cooking instructions

Also provide a shopping list organized by category (vegetables, proteins, grains, etc.).

Format the response as JSON.`;

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a professional nutritionist. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'Error generating meal plan' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    let mealPlanData;
    try {
      const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : aiResponse;
      mealPlanData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Parse error:', parseError);
      return new Response(JSON.stringify({ error: 'Error parsing meal plan data' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: mealPlan, error: mealPlanError } = await supabaseClient
      .from('meal_plans')
      .insert({
        user_id: user.id,
        title,
        days,
        target_calories: targetCalories,
        target_protein: targetProtein,
        target_carbs: targetCarbs,
        target_fats: targetFats,
        dietary_preferences: dietaryPreferences,
        allergens,
        meal_plan_data: mealPlanData,
        shopping_list: mealPlanData.shopping_list,
        is_premium: isPremium,
        credits_used: 0
      })
      .select()
      .single();

    if (mealPlanError) {
      console.error('Save error:', mealPlanError);
      return new Response(JSON.stringify({ error: 'Error saving meal plan' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ mealPlan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
