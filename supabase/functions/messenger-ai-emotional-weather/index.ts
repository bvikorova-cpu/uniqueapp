import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CREDIT_COST = 3;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check credits
    const { data: credits, error: creditsError } = await supabase
      .from('messenger_ai_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .single();

    if (creditsError || !credits || credits.credits_remaining < CREDIT_COST) {
      return new Response(JSON.stringify({ error: 'Insufficient credits', required: CREDIT_COST }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const conversationText = messages.map((m: any) => `${m.sender}: ${m.content}`).join('\n');

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
            content: `You are an emotional intelligence AI that analyzes conversations and provides an "emotional weather report". 
            Analyze the emotional tone, dynamics, and overall mood of the conversation.
            
            Return a JSON object with:
            {
              "weather": "sunny|cloudy|rainy|stormy|rainbow|foggy",
              "temperature": "warm|cool|cold|hot",
              "emoji": "appropriate weather emoji",
              "dominantEmotions": ["emotion1", "emotion2", "emotion3"],
              "emotionalScore": 1-100 (overall positivity),
              "dynamics": "brief description of relationship dynamics",
              "advice": "helpful suggestion for improving communication",
              "forecast": "prediction for where this conversation might lead"
            }`
          },
          {
            role: 'user',
            content: `Analyze this conversation:\n\n${conversationText}`
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    let analysis;
    
    try {
      const content = data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content };
    } catch {
      analysis = { raw: data.choices[0].message.content };
    }

    // Deduct credits
    await supabase
      .from('messenger_ai_credits')
      .update({ credits_remaining: credits.credits_remaining - CREDIT_COST })
      .eq('user_id', user.id);

    return new Response(JSON.stringify({ 
      analysis,
      creditsUsed: CREDIT_COST
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Emotional weather error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
