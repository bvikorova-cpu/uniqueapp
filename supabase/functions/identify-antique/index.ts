import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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
      throw new Error('Not authenticated');
    }

    const { imageUrl, analysisType } = await req.json();
    console.log('Identifying antique:', { imageUrl, analysisType, userId: user.id });

    // Define credit costs for different analysis types
    const creditCosts: Record<string, number> = {
      'basic': 3,        // Basic identification
      'valuation': 10,   // Market valuation
      'expert': 15,      // Complete expert report
      'authenticity': 20, // Authenticity analysis
      'history': 3,      // Historical story
      'restoration': 3   // Restoration advice
    };

    const creditsRequired = creditCosts[analysisType] || 3;

    // Check user credits
    const { data: creditsData, error: creditsError } = await supabaseClient
      .from('antique_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .maybeSingle();

    if (creditsError) {
      console.error('Error fetching credits:', creditsError);
      throw new Error('Failed to check credits');
    }

    if (!creditsData || creditsData.credits_remaining < creditsRequired) {
      return new Response(
        JSON.stringify({ error: `Insufficient credits. ${creditsRequired} credits required for ${analysisType} analysis.` }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare AI prompt based on analysis type
    let prompt = '';
    switch (analysisType) {
      case 'basic':
        prompt = `Analyze this antique item and provide:
1. Item identification (what is it)
2. Approximate time period/era
3. Style (e.g., Art Deco, Victorian, etc.)
4. Main materials used
5. Cultural origin
Format as JSON with keys: name, period, style, materials, origin`;
        break;
      case 'valuation':
        prompt = `Provide a detailed market valuation for this antique:
1. Estimated market value range (in EUR)
2. Factors affecting value
3. Rarity assessment
4. Market demand
5. Comparable sales
Format as JSON with keys: valueRange, factors, rarity, demand, comparables`;
        break;
      case 'expert':
        prompt = `Provide a comprehensive expert analysis:
1. Full identification and classification
2. Historical period and style
3. Manufacturing technique
4. Current market value estimation
5. Authenticity indicators
6. Condition assessment
7. Investment potential
Format as JSON with keys: identification, period, technique, value, authenticity, condition, investment`;
        break;
      case 'authenticity':
        prompt = `Conduct authenticity analysis:
1. Authenticity score (0-100)
2. Signs of authenticity
3. Red flags or concerns
4. Manufacturing method analysis
5. Age verification indicators
6. Comparison with known originals
Format as JSON with keys: score, authenticity_signs, concerns, manufacturing, age_indicators, comparison`;
        break;
      case 'history':
        prompt = `Create an engaging historical narrative:
1. Time period and historical context
2. Possible original use
3. Social and cultural significance
4. Likely owners or users
5. Historical events during its era
6. Journey through time
Format as JSON with keys: period, original_use, significance, owners, events, story`;
        break;
      case 'restoration':
        prompt = `Provide restoration and care advice:
1. Current condition assessment
2. Restoration priority (high/medium/low)
3. Cleaning recommendations
4. Repair suggestions
5. Preservation tips
6. Professional services needed
Format as JSON with keys: condition, priority, cleaning, repairs, preservation, professional_help`;
        break;
      default:
        prompt = 'Identify this antique item and provide basic information.';
    }

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Calling AI Gateway for antique analysis...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ]
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service credits exhausted. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices?.[0]?.message?.content;

    if (!analysisText) {
      console.error('No content in AI response:', JSON.stringify(aiData));
      throw new Error('Failed to generate analysis');
    }

    // Parse JSON from response
    let analysisResult;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : analysisText;
      analysisResult = JSON.parse(jsonString);
    } catch (e) {
      console.error('Failed to parse JSON, using raw text:', e);
      analysisResult = { raw_analysis: analysisText };
    }

    console.log('Analysis completed successfully');

    // Deduct credits
    const { error: updateError } = await supabaseClient
      .from('antique_credits')
      .update({ 
        credits_remaining: creditsData.credits_remaining - creditsRequired,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating credits:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        analysisResult,
        creditsUsed: creditsRequired,
        creditsRemaining: creditsData.credits_remaining - creditsRequired
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in identify-antique:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
