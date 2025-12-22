import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CREDIT_COST = 2;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientName, context, style } = await req.json();

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

    const styles: Record<string, string> = {
      poetic: 'Write in a poetic, lyrical style with metaphors',
      funny: 'Write in a humorous, witty style that makes them smile',
      heartfelt: 'Write in a sincere, touching emotional style',
      creative: 'Write in a creative, unique artistic style',
      motivational: 'Write in an inspiring, uplifting motivational style',
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
            content: `You are a master of writing beautiful, anonymous compliments that make people feel special.
            ${styles[style] || styles.heartfelt}
            
            Create a unique, memorable compliment that:
            - Is anonymous (no hints about the sender)
            - Is genuine and specific if context is provided
            - Makes the recipient feel truly valued
            - Is appropriate and respectful
            
            Return a JSON object with:
            {
              "compliment": "the beautiful compliment text",
              "emoji": "fitting emoji",
              "category": "friendship|kindness|talent|personality|beauty|wisdom"
            }`
          },
          {
            role: 'user',
            content: `Create an anonymous compliment for ${recipientName || 'someone special'}. ${context ? `Context: ${context}` : ''}`
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
    let result;
    
    try {
      const content = data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { compliment: content };
    } catch {
      result = { compliment: data.choices[0].message.content };
    }

    // Deduct credits
    await supabase
      .from('messenger_ai_credits')
      .update({ credits_remaining: credits.credits_remaining - CREDIT_COST })
      .eq('user_id', user.id);

    return new Response(JSON.stringify({ 
      ...result,
      creditsUsed: CREDIT_COST
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Anonymous compliment error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
