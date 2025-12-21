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
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
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

    const { dish_name, price_range } = await req.json();
    console.log('Suggesting wine pairing for:', dish_name);

    // Call OpenAI
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const prompt = `Recommend wine/drinks for the dish "${dish_name}".
${price_range ? `Price range: ${price_range}` : ''}

Return JSON:
{
  "pairings": [
    {
      "drink_name": "drink name",
      "type": "wine|beer|cocktail|other",
      "reason": "why it pairs well",
      "price_range": "€10-20",
      "serving_tips": "how to serve",
      "alternatives": ["alternative 1", "alternative 2"]
    }
  ]
}`;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
    
    let pairingData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      pairingData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      pairingData = {};
    }

    // Save to database
    const { data: savedPairing } = await supabase
      .from('wine_pairings')
      .insert({
        user_id: user.id,
        dish_name,
        pairing_suggestions: pairingData.pairings || [],
        credits_used: 1
      })
      .select()
      .single();

    // Deduct credits
    await supabase
      .from('cooking_credits')
      .update({ credits: credits.credits - 1 })
      .eq('user_id', user.id);

    console.log('Wine pairing suggested successfully');

    return new Response(JSON.stringify({ 
      pairings: pairingData.pairings || [],
      pairing_id: savedPairing.id,
      credits_remaining: credits.credits - 1
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in suggest-wine-pairing:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});