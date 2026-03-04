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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Not authenticated');
    }

    const { lifestyle, budget, currentWardrobe } = await req.json();

    // Check AI credits
    const { data: credits } = await supabaseClient
      .from('ai_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .single();

    if (!credits || credits.credits_remaining < 15) {
      return new Response(
        JSON.stringify({ error: 'Insufficient AI credits. Need 15 credits for capsule wardrobe analysis.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
      );
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
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
          {
            role: 'system',
            content: `You are a professional capsule wardrobe consultant. Create a comprehensive capsule wardrobe plan.
            Return a detailed JSON object with:
            - essential_pieces: array of must-have items with descriptions
            - color_palette: recommended color scheme
            - mix_match_combos: number of outfit combinations possible
            - shopping_list: what to buy to complete the capsule
            - styling_guide: how to maximize the wardrobe
            - seasonal_additions: optional seasonal pieces`
          },
          {
            role: 'user',
            content: `Create a capsule wardrobe plan for someone with this lifestyle: ${lifestyle}
            Budget considerations: ${budget}
            Current wardrobe: ${JSON.stringify(currentWardrobe)}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Try to parse JSON from AI response
    let capsuleData;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        capsuleData = JSON.parse(jsonMatch[0]);
      } else {
        capsuleData = {
          essential_pieces: [],
          color_palette: [],
          mix_match_combos: 0,
          shopping_list: [],
          styling_guide: aiResponse,
          seasonal_additions: []
        };
      }
    } catch (e) {
      capsuleData = {
        essential_pieces: [],
        color_palette: [],
        mix_match_combos: 0,
        shopping_list: [],
        styling_guide: aiResponse,
        seasonal_additions: []
      };
    }

    // Save as a styling session
    const { data: session, error: saveError } = await supabaseClient
      .from('styling_sessions')
      .insert({
        user_id: user.id,
        session_type: 'capsule_wardrobe',
        preferences: { lifestyle, budget },
        ai_recommendations: capsuleData,
        status: 'completed',
        credits_used: 15
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving session:', saveError);
    }

    // Deduct credits
    await supabaseClient
      .from('ai_credits')
      .update({ credits_remaining: credits.credits_remaining - 15 })
      .eq('user_id', user.id);

    // Log usage
    await supabaseClient
      .from('ai_usage_history')
      .insert({
        user_id: user.id,
        usage_type: 'capsule_wardrobe',
        credits_used: 15,
        description: 'Capsule wardrobe analysis'
      });

    return new Response(
      JSON.stringify({
        capsulePlan: capsuleData,
        sessionId: session?.id,
        creditsRemaining: credits.credits_remaining - 15
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in capsule-wardrobe:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});