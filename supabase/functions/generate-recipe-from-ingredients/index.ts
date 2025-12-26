import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { withRateLimit, RATE_LIMITS } from "../_shared/rate-limit.ts";

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

    // Rate limit check
    const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.ai_generation, corsHeaders, user.id);
    if (rateLimitResponse) return rateLimitResponse;

    // Check credits
    const { data: credits } = await supabase
      .from('cooking_credits')
      .select('credits, subscription_tier')
      .eq('user_id', user.id)
      .single();

    if (!credits || credits.credits < 1) {
      return new Response(JSON.stringify({ error: 'Insufficient credits' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { ingredients, dietary_preferences } = await req.json();
    console.log('Generating recipes for:', { ingredients, dietary_preferences });

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const prompt = `Generate 3 recipes from these ingredients: ${ingredients.join(', ')}.
${dietary_preferences?.length > 0 ? `Dietary preferences: ${dietary_preferences.join(', ')}.` : ''}

Return JSON in this format:
{
  "recipes": [
    {
      "title": "Recipe name",
      "description": "Short description",
      "difficulty": "easy|medium|hard",
      "prep_time": "time in minutes",
      "servings": 4,
      "calories": 450,
      "ingredients": ["ingredient 1", "ingredient 2"],
      "instructions": ["step 1", "step 2"],
      "tags": ["tag1", "tag2"]
    }
  ]
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
    
    let recipes;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      recipes = jsonMatch ? JSON.parse(jsonMatch[0]) : { recipes: [] };
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      recipes = { recipes: [] };
    }

    // Save to database
    const { data: savedGeneration } = await supabase
      .from('recipe_generations')
      .insert({
        user_id: user.id,
        ingredients,
        dietary_preferences,
        generated_recipes: recipes,
        credits_used: 1
      })
      .select()
      .single();

    // Deduct credits
    await supabase
      .from('cooking_credits')
      .update({ credits: credits.credits - 1 })
      .eq('user_id', user.id);

    console.log('Recipes generated successfully');

    return new Response(JSON.stringify({ 
      recipes: recipes.recipes,
      generation_id: savedGeneration.id,
      credits_remaining: credits.credits - 1
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-recipe-from-ingredients:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});