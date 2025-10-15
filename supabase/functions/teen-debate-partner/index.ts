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
    const { action, topic, position, messages } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const oppositePosition = position === 'for' ? 'against' : 'for';
    
    const systemPrompt = `You are an expert debate coach helping teenagers (13-18 years old) practice argumentation and critical thinking.
You will take the ${oppositePosition.toUpperCase()} position on the topic: "${topic}"
The student is arguing ${position.toUpperCase()}.

Your role is to:
1. Present well-reasoned arguments from the ${oppositePosition} perspective
2. Challenge the student's arguments constructively
3. Use evidence, logic, and real-world examples
4. Maintain a respectful, educational tone
5. Help the student develop stronger critical thinking skills
6. Point out logical fallacies if present, but in an encouraging way
7. Keep responses focused and concise (2-3 paragraphs max)

Be challenging but fair. Your goal is to help them learn, not to frustrate them.`;

    let userPrompt: string;
    
    if (action === 'start') {
      userPrompt = `The debate topic is: "${topic}". I'm taking the ${position.toUpperCase()} position. 
Please provide your opening argument from the ${oppositePosition.toUpperCase()} perspective to start the debate.`;
    } else {
      // Build conversation history
      const conversationHistory = messages.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      
      userPrompt = conversationHistory[conversationHistory.length - 1].content;
    }

    const aiMessages = action === 'start' 
      ? [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      : [
          { role: 'system', content: systemPrompt },
          ...messages.map((msg: { role: string; content: string }) => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))
        ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: aiMessages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in teen-debate-partner function:', error);
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
