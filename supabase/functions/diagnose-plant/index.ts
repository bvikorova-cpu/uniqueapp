import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { imageUrl, symptoms, plantId } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    
    if (!user) throw new Error('Not authenticated');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const creditsRequired = 5;

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

    // Diagnose plant disease using AI with vision
    const diagnosisPrompt = `Analyze this plant image for diseases or health issues.
${symptoms ? `User reported symptoms: ${symptoms}` : ''}

Provide:
1. Overall health assessment
2. Possible diseases or problems (list)
3. Severity level (low/medium/high)
4. Treatment recommendations (detailed steps)
5. Prevention tips

Format as JSON with keys: healthAssessment, possibleDiseases (array), severityLevel, treatmentSteps (array), preventionTips (array)`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system',
            content: 'You are an expert plant pathologist. Analyze plant images and provide accurate disease diagnosis and treatment recommendations.'
          },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: diagnosisPrompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Failed to diagnose plant');
    }

    const aiData = await response.json();
    const content = aiData.choices[0].message.content;
    
    // Parse the JSON response
    let diagnosisInfo;
    try {
      diagnosisInfo = JSON.parse(content);
    } catch {
      // If not valid JSON, create a structured response from the text
      diagnosisInfo = {
        healthAssessment: content,
        possibleDiseases: [],
        severityLevel: 'medium',
        treatmentSteps: [content],
        preventionTips: []
      };
    }

    // Save diagnosis to database
    const { data: diagnosis, error: dbError } = await supabaseClient
      .from('plant_diagnoses')
      .insert({
        user_id: user.id,
        plant_id: plantId || null,
        image_url: imageUrl,
        symptoms_description: symptoms,
        diagnosis: diagnosisInfo.healthAssessment,
        possible_diseases: diagnosisInfo.possibleDiseases,
        treatment_recommendations: diagnosisInfo.treatmentSteps,
        severity_level: diagnosisInfo.severityLevel,
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
        usage_type: 'plant_diagnosis',
        credits_used: creditsRequired,
        description: `Plant Disease Diagnosis - ${diagnosisInfo.severityLevel} severity`
      });

    return new Response(
      JSON.stringify({ 
        diagnosis: {
          ...diagnosis,
          ...diagnosisInfo
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in diagnose-plant:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});