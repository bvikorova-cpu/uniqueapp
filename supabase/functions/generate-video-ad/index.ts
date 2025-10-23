import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productService, targetAudience, keyMessage, tone, duration, platform, premiumFeatures } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Auth user
    const authHeader = req.headers.get('Authorization');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader! } } }
    );
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check credits
    const { data: credits } = await supabaseClient
      .from('video_ad_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const baseCost = 1;
    let totalCost = baseCost;
    
    if (premiumFeatures) {
      if (premiumFeatures.competitiveAnalysis) totalCost += 2;
      if (premiumFeatures.abTesting) totalCost += 2;
      if (premiumFeatures.voiceActorSuggestions) totalCost += 2;
      if (premiumFeatures.budgetOptimizer) totalCost += 2;
      if (premiumFeatures.performancePredictions) totalCost += 3;
    }

    if (!credits || credits.credits_remaining < totalCost) {
      throw new Error('Insufficient credits');
    }

    let prompt = `Create a professional video advertisement script IN ENGLISH:

Product/Service: ${productService}
Target Audience: ${targetAudience}
Key Message: ${keyMessage}
Tone: ${tone}
Duration: ${duration} seconds
Platform: ${platform}

IMPORTANT: Generate everything in ENGLISH language.

Generate: title, script, scenes (duration, description, voiceover, visuals), callToAction, musicSuggestion, targetEmotions`;

    if (premiumFeatures?.competitiveAnalysis) {
      prompt += `\n\nAlso include competitive analysis in English.`;
    }
    if (premiumFeatures?.budgetOptimizer) {
      prompt += `\n\nInclude budget breakdown (production, distribution, total) in Euros.`;
    }
    if (premiumFeatures?.performancePredictions) {
      prompt += `\n\nAdd performance predictions (reach, engagement, conversion) in English.`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a professional video advertising expert. Create engaging video ad scripts in ENGLISH. Always respond with valid JSON format. All content must be in English language.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) throw new Error('Rate limit exceeded');
      if (response.status === 402) throw new Error('Payment required');
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    let result = data.choices[0].message.content;
    
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0]);
    }

    // Deduct credits
    await supabaseClient
      .from('video_ad_credits')
      .update({ credits_remaining: credits.credits_remaining - totalCost })
      .eq('user_id', user.id);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
