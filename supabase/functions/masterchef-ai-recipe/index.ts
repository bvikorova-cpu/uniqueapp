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
    const { ingredients, cuisine } = await req.json();
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return new Response(JSON.stringify({ error: "Ingredients required" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      return new Response(JSON.stringify({ error: "OpenAI key not configured" }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const prompt = `You are a professional chef and recipe creator. Based on these ingredients: ${ingredients.join(', ')}${cuisine && cuisine !== 'any' ? ` (${cuisine} cuisine)` : ''}, create a detailed recipe. Include:
1. Recipe Name
2. Difficulty Level
3. Prep Time & Cook Time
4. Complete Ingredients List with measurements
5. Step-by-step Instructions
6. Chef's Tips
7. Nutritional estimate per serving`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: 'You are a professional chef.' }, { role: 'user', content: prompt }],
        max_tokens: 1500,
      }),
    });

    const data = await response.json();
    const recipe = data.choices?.[0]?.message?.content || 'Could not generate recipe.';

    return new Response(JSON.stringify({ recipe }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
