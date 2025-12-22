import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
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

CRISIS RESOURCES TO SHARE WHEN NEEDED:
- Emergency Services: 911 (US) or 112 (EU)
- Crisis Text Line: Text HOME to 741741
- National Suicide Prevention Lifeline: 988
- Childhelp National Child Abuse Hotline: 1-800-422-4453

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
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
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
