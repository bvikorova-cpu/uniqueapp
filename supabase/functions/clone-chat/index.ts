import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { withRateLimit, RATE_LIMITS } from "../_shared/rate-limit.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DAILY_LIMIT = 20;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Rate limit check
    const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.ai_generation, corsHeaders, user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const { message, cloneId, clonePersonality } = await req.json();
    console.log('Chat request for clone:', cloneId);

    // Check daily limit
    const today = new Date().toISOString().split('T')[0];
    
    const { data: limitData, error: limitError } = await supabase
      .from('clone_chat_daily_limits')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (limitError) {
      console.error('Error checking limit:', limitError);
      throw new Error('Failed to check daily limit');
    }

    const currentUsage = limitData?.responses_used || 0;
    
    if (currentUsage >= DAILY_LIMIT) {
      return new Response(JSON.stringify({ 
        error: 'Daily limit reached',
        limit: DAILY_LIMIT,
        used: currentUsage
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Save user message
    const { error: saveUserError } = await supabase
      .from('clone_chat_messages')
      .insert({
        user_id: user.id,
        clone_id: cloneId,
        role: 'user',
        content: message
      });

    if (saveUserError) {
      console.error('Error saving user message:', saveUserError);
    }

    // Get chat history
    const { data: history } = await supabase
      .from('clone_chat_messages')
      .select('role, content')
      .eq('user_id', user.id)
      .eq('clone_id', cloneId)
      .order('created_at', { ascending: true })
      .limit(20);

    const messages = [
      {
        role: 'system',
        content: `You are an AI clone with the following personality: ${clonePersonality}. 
        Respond naturally as this personality would. Be conversational, engaging, and stay in character.
        Keep responses concise but meaningful.`
      },
      ...(history || []).map(m => ({ role: m.role, content: m.content }))
    ];

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 500,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI error:', errorText);
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Save AI response
    const { error: saveAiError } = await supabase
      .from('clone_chat_messages')
      .insert({
        user_id: user.id,
        clone_id: cloneId,
        role: 'assistant',
        content: aiResponse
      });

    if (saveAiError) {
      console.error('Error saving AI message:', saveAiError);
    }

    // Update daily limit
    if (limitData) {
      await supabase
        .from('clone_chat_daily_limits')
        .update({ 
          responses_used: currentUsage + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', limitData.id);
    } else {
      await supabase
        .from('clone_chat_daily_limits')
        .insert({
          user_id: user.id,
          date: today,
          responses_used: 1
        });
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      remaining: DAILY_LIMIT - (currentUsage + 1)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in clone-chat:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
