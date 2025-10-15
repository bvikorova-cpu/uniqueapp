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
    const { interests, strengths, goals } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert career counselor specializing in helping teenagers (13-18 years old) explore career paths. 
Your role is to provide personalized, encouraging, and realistic career guidance based on their interests, strengths, and goals.

Provide:
1. 3-5 specific career paths that match their profile
2. Brief explanation of why each career fits their interests and strengths
3. Educational pathways for each career
4. Key skills they should develop
5. Realistic outlook and growth opportunities
6. Actionable next steps they can take now

Be encouraging, age-appropriate, and realistic. Format your response in a clear, easy-to-read structure with headings and bullet points.`;

    const userPrompt = `Here is a teenager looking for career guidance:

Interests and Hobbies: ${interests}
Strengths: ${strengths}
${goals ? `Career Goals: ${goals}` : ''}

Please provide comprehensive career guidance tailored to their profile.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const guidance = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ guidance }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in teen-career-counselor function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
