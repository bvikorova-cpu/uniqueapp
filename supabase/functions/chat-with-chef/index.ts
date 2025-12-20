import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check credits
    const { data: credits } = await supabase
      .from('cooking_credits')
      .select('credits, subscription_tier')
      .eq('user_id', user.id)
      .single();

    if (!credits || credits.credits < 1) {
      return new Response(JSON.stringify({ error: 'Insufficient credits' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, session_id } = await req.json();
    console.log('Chef chat message:', message);

    // Get or create session
    let session;
    if (session_id) {
      const { data } = await supabase
        .from('chef_chat_sessions')
        .select('*')
        .eq('id', session_id)
        .eq('user_id', user.id)
        .single();
      session = data;
    }

    if (!session) {
      const { data: newSession } = await supabase
        .from('chef_chat_sessions')
        .insert({
          user_id: user.id,
          messages: [],
          credits_used: 0
        })
        .select()
        .single();
      session = newSession;
    }

    const messages = session.messages || [];
    messages.push({ role: 'user', content: message });

    // Call OpenAI
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }
    
    const systemPrompt = `You are an experienced chef with broad knowledge about cooking, techniques, ingredients, and substitutions. 
Answer in a friendly and detailed manner. Provide practical advice and tips.`;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`OpenAI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const reply = aiData.choices[0].message.content;
    
    messages.push({ role: 'assistant', content: reply });

    // Update session
    await supabase
      .from('chef_chat_sessions')
      .update({
        messages,
        credits_used: session.credits_used + 1
      })
      .eq('id', session.id);

    // Deduct credits
    await supabase
      .from('cooking_credits')
      .update({ credits: credits.credits - 1 })
      .eq('user_id', user.id);

    console.log('Chef chat reply sent');

    return new Response(JSON.stringify({ 
      reply,
      session_id: session.id,
      credits_remaining: credits.credits - 1
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat-with-chef:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});