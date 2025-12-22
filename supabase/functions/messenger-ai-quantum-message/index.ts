import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CREDIT_COST = 10;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { originalMessage, variationType } = await req.json();

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

    const variationPrompts: Record<string, string> = {
      mood: `Create 5 variations of this message for different moods:
        1. Happy/Excited version
        2. Calm/Relaxed version
        3. Professional/Formal version
        4. Playful/Funny version
        5. Romantic/Sweet version`,
      time: `Create 5 variations of this message for different times:
        1. Morning greeting version
        2. Afternoon casual version
        3. Evening relaxed version
        4. Night intimate version
        5. Weekend fun version`,
      personality: `Create 5 variations of this message for different personality types:
        1. Extrovert enthusiastic version
        2. Introvert thoughtful version
        3. Analytical detailed version
        4. Creative artistic version
        5. Empathetic caring version`,
    };

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
            content: `You are a creative message writer. ${variationPrompts[variationType] || variationPrompts.mood}
            
            Return a JSON object with:
            {
              "variations": [
                { "type": "type name", "message": "variation text", "emoji": "fitting emoji" }
              ]
            }`
          },
          {
            role: 'user',
            content: `Original message: "${originalMessage}"`
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
    let variations;
    
    try {
      const content = data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      variations = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content };
    } catch {
      variations = { raw: data.choices[0].message.content };
    }

    // Deduct credits
    await supabase
      .from('messenger_ai_credits')
      .update({ credits_remaining: credits.credits_remaining - CREDIT_COST })
      .eq('user_id', user.id);

    return new Response(JSON.stringify({ 
      variations,
      creditsUsed: CREDIT_COST
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Quantum message error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
