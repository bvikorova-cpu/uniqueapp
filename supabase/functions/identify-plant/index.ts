import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { withRateLimit, RATE_LIMITS } from "../_shared/rate-limit.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    
    if (!user) throw new Error('Not authenticated');

    // Rate limit check
    const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.ai_generation, corsHeaders, user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');

    const creditsRequired = 3;

    // Check credits
    const { data: creditsData } = await supabaseClient
      .from('ai_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .single();

    if (!creditsData || creditsData.credits_remaining < creditsRequired) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Identify plant using OpenAI with vision
    const identificationPrompt = `Analyze this plant image and provide:
1. Common name
2. Scientific name
3. Plant type (houseplant, outdoor, succulent, etc.)
4. Basic care instructions (watering, light, temperature)
5. Interesting facts

Format as JSON with keys: commonName, scientificName, plantType, careInstructions (object with watering, light, temperature), facts`;

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
            content: 'You are an expert botanist. Identify plants accurately and provide helpful care information. Always respond with valid JSON.'
          },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: identificationPrompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error('Failed to identify plant');
    }

    const aiData = await response.json();
    const content = aiData.choices[0].message.content;
    
    // Parse the JSON response
    let plantInfo;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      plantInfo = JSON.parse(jsonString);
    } catch {
      plantInfo = {
        commonName: 'Unknown Plant',
        scientificName: 'Unable to identify',
        plantType: 'Unknown',
        careInstructions: { watering: content, light: '', temperature: '' },
        facts: content
      };
    }

    // Save identification to database
    const { data: identification, error: dbError } = await supabaseClient
      .from('plant_identifications')
      .insert({
        user_id: user.id,
        image_url: imageUrl,
        identified_name: plantInfo.commonName,
        scientific_name: plantInfo.scientificName,
        confidence_score: 0.85,
        care_tips: plantInfo.careInstructions,
        additional_info: plantInfo.facts,
        credits_used: creditsRequired
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // Deduct credits
    await supabaseClient
      .from('ai_credits')
      .update({ 
        credits_remaining: creditsData.credits_remaining - creditsRequired,
        last_used_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    // Log usage
    await supabaseClient
      .from('ai_usage_history')
      .insert({
        user_id: user.id,
        usage_type: 'plant_identification',
        credits_used: creditsRequired,
        description: `Plant Identification - ${plantInfo.commonName}`
      });

    return new Response(
      JSON.stringify({ 
        identification: {
          ...identification,
          ...plantInfo
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in identify-plant:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
