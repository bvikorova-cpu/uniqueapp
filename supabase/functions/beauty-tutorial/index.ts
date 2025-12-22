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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Not authenticated');
    }

    const { lookDescription } = await req.json();

    // Check AI credits
    const { data: credits } = await supabaseClient
      .from('ai_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .single();

    if (!credits || credits.credits_remaining < 2) {
      return new Response(
        JSON.stringify({ error: 'Insufficient AI credits. Need 2 credits for makeup tutorial.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
      );
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const prompt = `Create a detailed step-by-step makeup tutorial for: ${lookDescription}

Provide the tutorial in JSON format:
{
  "title": "tutorial name",
  "difficulty": "beginner/intermediate/advanced",
  "timeNeeded": "X minutes",
  "steps": [
    {"step": 1, "title": "step name", "description": "detailed instructions", "tip": "helpful tip"},
    ...
  ],
  "productsNeeded": [
    {"category": "foundation/eyeshadow/etc", "product": "product type", "optional": false},
    ...
  ],
  "proTips": ["tip1", "tip2", "tip3"]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert makeup artist. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No tutorial generated');
    }

    // Parse JSON from response
    let tutorial;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      tutorial = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse JSON:', content);
      throw new Error('Failed to parse tutorial');
    }

    // Save to database
    await supabaseClient
      .from('beauty_tutorials')
      .insert({
        user_id: user.id,
        look_description: lookDescription,
        tutorial_steps: tutorial.steps || [],
        products_needed: tutorial.productsNeeded || [],
        difficulty_level: tutorial.difficulty || 'intermediate',
        credits_used: 2
      });

    // Deduct credits
    await supabaseClient
      .from('ai_credits')
      .update({ credits_remaining: credits.credits_remaining - 2 })
      .eq('user_id', user.id);

    // Log usage
    await supabaseClient
      .from('ai_usage_history')
      .insert({
        user_id: user.id,
        usage_type: 'beauty_tutorial',
        credits_used: 2,
        description: `Makeup tutorial: ${lookDescription}`
      });

    return new Response(
      JSON.stringify({
        tutorial,
        creditsRemaining: credits.credits_remaining - 2
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in beauty-tutorial:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
