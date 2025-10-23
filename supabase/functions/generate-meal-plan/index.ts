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
      title,
      days,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFats,
      dietaryPreferences,
      allergens,
      isPremium
    } = await req.json();

    console.log('Generating meal plan for user:', user.id);

    // Check credits
    const creditsNeeded = 50;
    const { data: credits } = await supabaseClient
      .from('ai_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .single();

    if (!credits || credits.credits_remaining < creditsNeeded) {
      return new Response(JSON.stringify({ error: 'Insufficient credits' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check subscription limits for free users
    const { data: subscription } = await supabaseClient
      .from('nutrition_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!isPremium && subscription?.subscription_type === 'free') {
      const { count } = await supabaseClient
        .from('meal_plans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', new Date(new Date().setDate(1)).toISOString());

      if (count && count >= 3) {
        return new Response(JSON.stringify({ error: 'Monthly limit reached. Upgrade to premium!' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Build AI prompt
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

Format the response as JSON with this structure:
{
  "days": [
    {
      "day": 1,
      "meals": {
        "breakfast": { "name": "", "ingredients": [], "calories": 0, "protein": 0, "carbs": 0, "fats": 0, "instructions": "" },
        "lunch": { "name": "", "ingredients": [], "calories": 0, "protein": 0, "carbs": 0, "fats": 0, "instructions": "" },
        "dinner": { "name": "", "ingredients": [], "calories": 0, "protein": 0, "carbs": 0, "fats": 0, "instructions": "" },
        "snack1": { "name": "", "ingredients": [], "calories": 0, "protein": 0, "carbs": 0, "fats": 0 },
        "snack2": { "name": "", "ingredients": [], "calories": 0, "protein": 0, "carbs": 0, "fats": 0 }
      }
    }
  ],
  "shoppingList": {
    "vegetables": [],
    "proteins": [],
    "grains": [],
    "dairy": [],
    "other": []
  }
}`;

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a professional nutritionist creating personalized meal plans. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
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
    const generatedText = aiData.choices[0].message.content;
    
    // Parse JSON from AI response
    let planData;
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      planData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(generatedText);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      planData = { days: [], shoppingList: {} };
    }

    // Save meal plan
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
        dietary_preferences: dietaryPreferences || [],
        allergens: allergens || [],
        plan_data: planData.days || [],
        shopping_list: planData.shoppingList || {},
        is_premium: isPremium || false
      })
      .select()
      .single();

    if (mealPlanError) {
      console.error('Error saving meal plan:', mealPlanError);
      throw mealPlanError;
    }

    // Deduct credits
    await supabaseClient
      .from('ai_credits')
      .update({ 
        credits_remaining: credits.credits_remaining - creditsNeeded,
        last_used_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    // Log usage
    await supabaseClient
      .from('ai_usage_logs')
      .insert({
        user_id: user.id,
        feature_type: 'meal_plan_generation',
        credits_used: creditsNeeded
      });

    console.log('Meal plan generated successfully:', mealPlan.id);

    return new Response(JSON.stringify({ mealPlan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-meal-plan function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
