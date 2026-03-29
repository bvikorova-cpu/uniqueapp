import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipeName, ingredients } = await req.json();
    if (!recipeName || !ingredients) {
      return new Response(JSON.stringify({ error: "Recipe name and ingredients required" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      return new Response(JSON.stringify({ error: "OpenAI key not configured" }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const prompt = `Analyze the nutritional content of this recipe:
Recipe: ${recipeName}
Ingredients: ${ingredients}

Provide a detailed nutritional breakdown including:
1. Calories per serving
2. Macronutrients (protein, carbs, fat)
3. Key vitamins and minerals
4. Health score (1-10)
5. Dietary notes (gluten-free, vegan, etc.)
6. Healthier substitution suggestions`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: 'You are a nutritionist and food scientist.' }, { role: 'user', content: prompt }],
        max_tokens: 1200,
      }),
    });

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || 'Could not analyze nutrition.';

    return new Response(JSON.stringify({ analysis }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
