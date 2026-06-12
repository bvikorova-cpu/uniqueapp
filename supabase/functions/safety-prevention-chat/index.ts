import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Require auth — prevents anonymous abuse of paid AI quota
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const supa = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supa.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
      return new Response(JSON.stringify({ error: 'Invalid messages payload' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const systemPrompt = `You are a compassionate and supportive AI assistant specializing in bullying prevention and emotional support. Your role is to:

1. LISTEN with empathy and validate feelings
2. PROVIDE information about bullying prevention and safety
3. OFFER coping strategies and emotional support
4. GUIDE users toward appropriate resources and professional help

IMPORTANT GUIDELINES:
- Always be warm, understanding, and non-judgmental
- Never dismiss or minimize someone's experiences
- Encourage users to speak with trusted adults, counselors, or professionals
- If someone mentions self-harm, abuse, or crisis situations, immediately provide crisis hotline information
- Keep responses supportive but concise (2-4 paragraphs max)
- Use simple, clear language suitable for all ages
- Focus on empowerment and building resilience

CRITICAL DISCLAIMER TO INCLUDE WHEN APPROPRIATE:
"Remember, I'm an AI assistant providing general support and information. For serious concerns, please reach out to a professional counselor, therapist, or crisis helpline. Your wellbeing matters, and there are trained professionals who can help."

CRISIS RESOURCES TO SHARE WHEN NEEDED (always advise the user to use their LOCAL emergency number — never assume a country):
- Emergency Services: the local emergency number for the user's country (e.g. 112 in the EU, 911 in the US/CA, 999 in the UK, 000 in AU). If unsure, ask the user which country they are in.
- International suicide & crisis helplines directory: https://findahelpline.com
- Encourage contacting a trusted adult, school counselor, family doctor, or local mental-health service.

Topics you can help with:
- Understanding and recognizing bullying
- Coping strategies for bullying victims
- Building self-confidence and resilience
- Reporting bullying safely
- Supporting friends who are bullied
- Online safety and cyberbullying
- Conflict resolution
- Self-care and emotional wellbeing

Remember: You are NOT a replacement for professional mental health services. Always encourage seeking professional help for serious issues.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error('AI service error');
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "I'm here to help. Could you tell me more about what you're going through?";

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in safety-prevention-chat:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
