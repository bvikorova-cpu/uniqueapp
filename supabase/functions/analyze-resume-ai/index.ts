import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const CREDITS_COST = 5;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Unauthorized');
    }

    const { resumeText, jobTitle, jobDescription } = await req.json();
    console.log('Analyzing resume for user:', user.id);
    console.log('Resume text length:', resumeText?.length || 0);
    console.log('Job title:', jobTitle);

    if (!resumeText || resumeText.trim().length < 50) {
      throw new Error('Resume text is too short. Please provide more content.');
    }

    // Check if user has premium subscription or enough credits
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    const isPremium = !!subscription;
    console.log('User is premium:', isPremium);

    if (!isPremium) {
      // Check credits from ai_credits table
      const { data: credits } = await supabase
        .from('ai_credits')
        .select('credits_remaining')
        .eq('user_id', user.id)
        .single();

      const currentCredits = credits?.credits_remaining || 0;
      console.log('User credits:', currentCredits);

      if (currentCredits < CREDITS_COST) {
        return new Response(JSON.stringify({ 
          error: 'Insufficient credits',
          creditsNeeded: CREDITS_COST,
          currentCredits: currentCredits,
          requiresPremium: true
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Deduct credits
      const { error: deductError } = await supabase
        .from('ai_credits')
        .update({ credits_remaining: currentCredits - CREDITS_COST })
        .eq('user_id', user.id);

      if (deductError) {
        console.error('Error deducting credits:', deductError);
        throw new Error('Failed to deduct credits');
      }
      console.log('Deducted', CREDITS_COST, 'credits from user');
    }

    // Track AI usage
    const { error: usageError } = await supabase
      .from('ai_usage_history')
      .insert({
        user_id: user.id,
        usage_type: 'resume_analysis',
        credits_used: isPremium ? 0 : CREDITS_COST,
        description: `Resume analysis for ${jobTitle || 'general'}`
      });

    if (usageError) {
      console.error('Error tracking usage:', usageError);
    }

    // Call OpenAI API
    const systemPrompt = `You are an expert HR consultant and career coach. Analyze the provided resume and provide actionable feedback.

Your response MUST be in valid JSON format with this exact structure:
{
  "professionalScore": <number 1-100>,
  "scoreBreakdown": {
    "formatting": <number 1-100>,
    "content": <number 1-100>,
    "keywords": <number 1-100>,
    "experience": <number 1-100>
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": [
    {
      "title": "Improvement title",
      "description": "Detailed actionable advice",
      "priority": "high" | "medium" | "low"
    }
  ],
  "keywordsMissing": ["keyword1", "keyword2"],
  "hireabilityTips": "A paragraph with specific tips to increase hireability by 40%",
  "summary": "A brief professional summary of the resume"
}

Be specific, actionable, and encouraging. Focus on practical improvements.`;

    const userPrompt = jobTitle && jobDescription 
      ? `Analyze this resume for the position of "${jobTitle}":\n\nJob Description:\n${jobDescription}\n\nResume:\n${resumeText}`
      : `Analyze this resume for general job applications:\n\n${resumeText}`;

    console.log('Calling OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    const content = data.choices[0].message.content;
    
    // Parse the JSON response
    let analysis;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.log('Raw content:', content);
      // Return a structured error response
      analysis = {
        professionalScore: 0,
        scoreBreakdown: { formatting: 0, content: 0, keywords: 0, experience: 0 },
        strengths: [],
        improvements: [{ title: 'Analysis Error', description: 'Could not parse resume. Please try again.', priority: 'high' }],
        keywordsMissing: [],
        hireabilityTips: 'Please try again with a properly formatted resume.',
        summary: 'Unable to analyze resume.'
      };
    }

    console.log('Analysis complete, professional score:', analysis.professionalScore);

    return new Response(JSON.stringify({ 
      success: true,
      analysis,
      creditsUsed: isPremium ? 0 : CREDITS_COST,
      isPremium
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in analyze-resume-ai function:', error);
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
